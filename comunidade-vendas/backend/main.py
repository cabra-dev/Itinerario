import os
import sys
import hashlib
from dotenv import load_dotenv

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

class LoginRequest(BaseModel):
    login: str
    senha: str

class UsuarioCreate(BaseModel):
    nome: str = Field(..., min_length=1)
    login: str = Field(..., min_length=3)
    senha: str = Field(..., min_length=4)
    perfil: str = Field(default="usuario")
    categorias: List[int] = Field(default=[])

class CategoriaCreate(BaseModel):
    nome: str = Field(..., min_length=1)

class AtribuirCategorias(BaseModel):
    usuario_id: int
    categoria_ids: List[int]

class AlterarSenha(BaseModel):
    usuario_id: int
    nova_senha: str = Field(..., min_length=4)

def hash_senha(senha: str) -> str:
    return hashlib.sha256(senha.encode()).hexdigest()

# 3. Ciclo de Vida do Banco
@app.on_event("startup")
async def startup():
    try:
        await db.connect()
        print("Banco conectado com sucesso!")
        admin = await db.usuario.find_first(where={'login': 'admin'})
        if not admin:
            await db.usuario.create(data={
                'nome': 'Administrador',
                'login': 'admin',
                'senha': hash_senha('admin123'),
                'perfil': 'admin',
                'ativo': True
            })
            print("Admin padrao criado: login=admin senha=admin123")
    except Exception as e:
        print(f"Erro critico no banco: {e}")

@app.on_event("shutdown")
async def shutdown():
    if db.is_connected():
        await db.disconnect()

# 4. Rotas de Autenticação

@app.post("/auth/login")
async def login(dados: LoginRequest):
    try:
        usuario = await db.usuario.find_first(where={'login': dados.login})
        if not usuario:
            raise HTTPException(status_code=401, detail="Login ou senha invalidos.")
        if not usuario.ativo:
            raise HTTPException(status_code=401, detail="Usuario inativo.")
        if usuario.senha != hash_senha(dados.senha):
            raise HTTPException(status_code=401, detail="Login ou senha invalidos.")

        # Busca categorias do usuário
        categorias = await db.usuariocategoria.find_many(
            where={'usuarioId': usuario.id},
            include={'categoria': True}
        )
        cats = [uc.categoria.nome for uc in categorias if uc.categoria]

        return {
            "id": usuario.id,
            "nome": usuario.nome,
            "login": usuario.login,
            "perfil": usuario.perfil,
            "categorias": cats
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
        status_code=500,
        detail=str(e)
    )

@app.get("/auth/usuarios")
async def listar_usuarios():
    try:
        usuarios = await db.usuario.find_many(
            order={'nome': 'asc'},
            include={'categorias': {'include': {'categoria': True}}}
        )
        resultado = []
        for u in usuarios:
            cats = [uc.categoria.nome for uc in u.categorias if uc.categoria]
            resultado.append({
                "id": u.id,
                "nome": u.nome,
                "login": u.login,
                "perfil": u.perfil,
                "ativo": u.ativo,
                "categorias": cats
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar usuarios.")

@app.post("/auth/usuarios")
async def criar_usuario(dados: UsuarioCreate):
    try:
        existe = await db.usuario.find_first(where={'login': dados.login})
        if existe:
            raise HTTPException(status_code=400, detail="Login ja existe.")
        usuario = await db.usuario.create(data={
            'nome': dados.nome,
            'login': dados.login,
            'senha': hash_senha(dados.senha),
            'perfil': dados.perfil,
            'ativo': True
        })
        # Atribui categorias se informadas
        for cat_id in dados.categorias:
            await db.usuariocategoria.create(data={
                'usuarioId': usuario.id,
                'categoriaId': cat_id
            })
        return usuario
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao criar usuario.")

@app.delete("/auth/usuarios/{id}")
async def deletar_usuario(id: int):
    try:
        usuario = await db.usuario.find_unique(where={'id': id})
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado.")
        if usuario.login == 'admin':
            raise HTTPException(status_code=400, detail="Nao e possivel deletar o admin.")
        await db.usuariocategoria.delete_many(where={'usuarioId': id})
        await db.usuario.delete(where={'id': id})
        return {"message": "Usuario removido com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar usuario.")

@app.post("/auth/atribuir-categorias")
async def atribuir_categorias(dados: AtribuirCategorias):
    try:
        await db.usuariocategoria.delete_many(where={'usuarioId': dados.usuario_id})
        for cat_id in dados.categoria_ids:
            await db.usuariocategoria.create(data={
                'usuarioId': dados.usuario_id,
                'categoriaId': cat_id
            })
        return {"message": "Categorias atribuidas com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao atribuir categorias.")
# Altera senha de qualquer usuário (apenas admin pode chamar)
@app.put("/auth/usuarios/{id}/senha")
async def alterar_senha(id: int, dados: AlterarSenha):
    try:
        usuario = await db.usuario.find_unique(where={'id': id})
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado.")
        await db.usuario.update(
            where={'id': id},
            data={'senha': hash_senha(dados.nova_senha)}
        )
        return {"message": "Senha alterada com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao alterar senha.")
# 5. Rotas de Categorias

@app.get("/categorias")
async def listar_categorias():
    try:
        return await db.categoria.find_many(order={'nome': 'asc'})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao listar categorias.")

@app.post("/categorias")
async def criar_categoria(dados: CategoriaCreate):
    try:
        existe = await db.categoria.find_first(where={'nome': dados.nome})
        if existe:
            raise HTTPException(status_code=400, detail="Categoria ja existe.")
        return await db.categoria.create(data={'nome': dados.nome})
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao criar categoria.")

@app.delete("/categorias/{id}")
async def deletar_categoria(id: int):
    try:
        await db.usuariocategoria.delete_many(where={'categoriaId': id})
        await db.categoria.delete(where={'id': id})
        return {"message": "Categoria removida com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao deletar categoria.")

# 6. Rotas de Produtos

@app.get("/produtos")
async def listar_produtos(perfil: str = "admin", categorias: str = ""):
    try:
        if perfil == "admin":
            return await db.produto.find_many(order={'nome': 'asc'})
        else:
            cats = [c.strip() for c in categorias.split(",") if c.strip()]
            if not cats:
                return []
            return await db.produto.find_many(
                where={'categoria': {'in': cats}},
                order={'nome': 'asc'}
            )
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

# 7. Rotas de Vendas

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

# 8. Dashboard e Estatísticas

@app.get("/dashboard/stats")
async def get_stats(perfil: str = "admin", categorias: str = ""):
    try:
        if perfil == "admin":
            produtos = await db.produto.find_many()
            vendas = await db.venda.find_many()
        else:
            cats = [c.strip() for c in categorias.split(",") if c.strip()]
            if not cats:
                return {
                    "total_estoque_valor": 0,
                    "faturamento_total": 0,
                    "itens_baixo_estoque": 0,
                    "total_itens_vendidos": 0,
                    "total_produtos_cadastrados": 0,
                }
            produtos = await db.produto.find_many(where={'categoria': {'in': cats}})
            produto_ids = [p.id for p in produtos]
            vendas = await db.venda.find_many(
                where={'produtoId': {'in': produto_ids}}
            ) if produto_ids else []

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

# 9. Execução
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)