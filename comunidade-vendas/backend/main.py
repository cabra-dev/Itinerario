import os
import sys
from dotenv import load_dotenv

# Encontra o .env tanto em desenvolvimento quanto instalado
if getattr(sys, 'frozen', False):
    base_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(base_path, '.env'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Comunidade Gestor API")

# 1. Configuração de CORS
origins = [
    "https://itinerario-sigma.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

db = Prisma()

# 2. Esquemas de Dados
class ProdutoCreate(BaseModel):
    nome: str = Field(..., min_length=1)
    categoria: str = Field(..., min_length=1)
    preco: float = Field(..., gt=0)
    estoque: int = Field(..., ge=0)

class VendaCreate(BaseModel):
    produto_id: int 
    quantidade: int

# 3. Ciclo de Vida do Banco
@app.on_event("startup")
async def startup():
    try:
        await db.connect()
        print("Banco conectado com sucesso!")
    except Exception as e:
        print(f"Erro critico no banco: {e}")

@app.on_event("shutdown")
async def shutdown():
    if db.is_connected():
        await db.disconnect()

# 4. Rotas de Produtos

@app.get("/produtos")
async def listar_produtos():
    try:
        return await db.produto.find_many(order={'nome': 'asc'})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produtos: {str(e)}")

@app.post("/produtos")
async def criar_produto(dados: ProdutoCreate):
    try:
        return await db.produto.create(
            data={
                "nome": dados.nome,
                "categoria": dados.categoria,
                "preco": dados.preco,
                "estoque": dados.estoque,
                "vendido": 0
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao criar produto.")

@app.put("/produtos/{id}")
async def editar_produto(id: int, dados: ProdutoCreate):
    try:
        return await db.produto.update(
            where={'id': id},
            data={
                "nome": dados.nome,
                "categoria": dados.categoria,
                "preco": dados.preco,
                "estoque": dados.estoque
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Erro ao atualizar produto.")

@app.delete("/produtos/{id}")
async def deletar_produto(id: int):
    try:
        vendas = await db.venda.find_first(where={'produtoId': id})
        if vendas:
            raise HTTPException(status_code=400, detail="Nao e possivel deletar produto com historico de vendas.")
        
        await db.produto.delete(where={'id': id})
        return {"message": "Removido com sucesso"}
    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(status_code=500, detail="Erro interno ao deletar.")

# 5. Rotas de Vendas

@app.post("/vendas")
async def registrar_venda(venda: VendaCreate):
    produto = await db.produto.find_unique(where={'id': venda.produto_id})
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto nao encontrado.")
    
    if produto.estoque < venda.quantidade:
        raise HTTPException(status_code=400, detail="Estoque insuficiente.")

    valor_total = produto.preco * venda.quantidade

    try:
        async with db.tx() as transaction:
            await transaction.produto.update(
                where={'id': venda.produto_id},
                data={
                    'estoque': produto.estoque - venda.quantidade,
                    'vendido': produto.vendido + venda.quantidade
                }
            )
            nova_venda = await transaction.venda.create(
                data={
                    'produtoId': venda.produto_id,
                    'quantidade': venda.quantidade,
                    'valorTotal': valor_total
                }
            )
        return nova_venda
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao processar transacao de venda.")

# 6. Dashboard e Estatísticas

@app.get("/dashboard/stats")
async def get_stats():
    try:
        produtos = await db.produto.find_many()
        vendas = await db.venda.find_many()

        total_estoque_valor = sum(p.estoque * p.preco for p in produtos) if produtos else 0
        faturamento_total = sum(v.valorTotal for v in vendas) if vendas else 0
        itens_baixo_estoque = len([p for p in produtos if p.estoque < 5]) if produtos else 0
        total_itens_vendidos = sum(p.vendido for p in produtos) if produtos else 0
        
        return {
            "total_estoque_valor": total_estoque_valor,
            "faturamento_total": faturamento_total,
            "itens_baixo_estoque": itens_baixo_estoque,
            "total_itens_vendidos": total_itens_vendidos,
            "total_produtos_cadastrados": len(produtos),
        }
    except Exception as e:
        print(f"Erro Stats: {e}")
        return {
            "total_estoque_valor": 0,
            "faturamento_total": 0,
            "itens_baixo_estoque": 0,
            "total_itens_vendidos": 0,
            "total_produtos_cadastrados": 0,
        }

# 7. Execução
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)