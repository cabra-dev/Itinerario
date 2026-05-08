import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    # Tenta criar um produto de teste
    novo_produto = await db.produto.create(
        data={
            'nome': 'Produto Teste',
            'categoria': 'Teste',
            'preco': 10.0,
            'estoque': 100
        }
    )
    print(f"Sucesso! Produto criado com ID: {novo_produto.id}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())