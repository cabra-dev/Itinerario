import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from pydantic import BaseModel
from typing import List
from datetime import datetime

# 1. Configurações Iniciais
# No Render, as variáveis de ambiente já estão no SO, load_dotenv é opcional mas não atrapalha
app = FastAPI(title="Comunidade Gestor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Essencial para o seu React (Vercel) conseguir acessar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Prisma()

# 2. Esquemas de Dados (Pydantic)
class ProdutoCreate(BaseModel):
    nome: str
    categoria: str
    preco: float
    estoque: int

class VendaCreate(BaseModel):
    produto_id: int 
    quantidade: int

# 3. Ciclo de Vida do Banco
@app.on_event("startup")
async def startup():
    try:
        # Tenta conectar, mas se falhar, printa o erro no log e não deixa o app morrer
        await db.connect()
        print("✅ Banco conectado com sucesso!")
    except Exception as e:
        print(f"❌ Erro crítico no banco: {e}")
        # Não dê raise aqui agora, deixe o app subir mesmo sem banco só para testar

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# 4. Rotas de Produtos (CRUD Completo)

@app.get("/produtos")
async def listar_produtos():
    return await db.produto.find_many(order={'nome': 'asc'})

@app.post("/produtos")
async def criar_produto(dados: ProdutoCreate):
    return await db.produto.create(
        data={
            "nome": dados.nome,
            "categoria": dados.categoria,
            "preco": dados.preco,
            "estoque": dados.estoque,
            "vendido": 0
        }
    )

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
        await db.produto.delete(where={'id': id})
        return {"message": "Removido com sucesso"}
    except Exception:
        raise HTTPException(
            status_code=400, 
            detail="Não é possível deletar produto com histórico de vendas."
        )

# 5. Rotas de Vendas

@app.post("/vendas")
async def registrar_venda(venda: VendaCreate):
    produto = await db.produto.find_unique(where={'id': venda.produto_id})
    
    if not produto or produto.estoque < venda.quantidade:
        raise HTTPException(status_code=400, detail="Venda inválida ou estoque insuficiente.")

    valor_total = produto.preco * venda.quantidade

    # Transação garante que ou tudo acontece ou nada (QA: Atomicidade)
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

# 6. Dashboard e Relatórios

@app.get("/dashboard/stats")
async def get_stats():
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

@app.get("/relatorios/vendas-recentes")
async def relatorio_vendas():
    vendas = await db.venda.find_many(
        include={'produto': True},
        order={'dataVenda': 'desc'}
    )
    return [
        {
            "data": v.dataVenda.strftime("%d/%m/%Y %H:%M"),
            "produto": v.produto.nome if v.produto else "Excluído",
            "quantidade": v.quantidade,
            "total": v.valorTotal
        } for v in vendas
    ]

# 7. Execução do Servidor (Modificado para Deploy)
if __name__ == "__main__":
    import uvicorn
    # Em produção, o Render ignora esse bloco e usa o Start Command das configurações
    # Deixamos como 0.0.0.0 para aceitar conexões externas caso teste localmente em rede
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)