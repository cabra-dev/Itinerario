# 🌵 Bodega Digital

Aplicação **desktop para Windows** desenvolvida para simplificar o controle de estoque, gerenciamento de inventário e lançamento de vendas de produtos artesanais e comidas regionais. Com identidade visual nordestina, conta com sistema de login, controle por categorias, exportação de relatórios em PDF e CI/CD automatizado.

---

## 🎯 Objetivo

O Bodega Digital foi criado para atender pequenos grupos de artesanato e culinária regional da Paraíba, oferecendo uma ferramenta centralizada e intuitiva. Ao lançar uma venda, o estoque é baixado em tempo real usando transações seguras no banco de dados, recalculando o faturamento e o patrimônio total instantaneamente no Dashboard.

---

## 💻 Instalação (usuário final)

1. Acesse a página de [Releases](https://github.com/cabra-dev/Itinerario/releases)
2. Baixe o arquivo `Bodega Digital Setup x.x.x.exe`
3. Execute e siga a instalação normalmente
4. Abra o app pelo atalho criado no Desktop

> ⚠️ É necessário conexão com a internet, pois o banco de dados é online.

---

## 🔐 Sistema de Acesso

O app possui dois níveis de acesso:

- **Admin** — acesso total: cadastra produtos, gerencia usuários, cria categorias e visualiza todos os dados
- **Usuário** — acesso restrito por categoria: vê e vende apenas produtos das categorias atribuídas pelo admin

---

## 🛠️ Tecnologias

**Desktop**
- Electron — empacotamento como app desktop Windows
- electron-builder — geração do instalador NSIS

**Frontend**
- React (TypeScript) + Vite
- React Router Dom (HashRouter)
- Context API
- Axios
- jsPDF & jsPDF-AutoTable

**Backend**
- FastAPI (Python 3)
- Prisma ORM + PostgreSQL (Supabase)
- Uvicorn
- Pydantic
- PyInstaller

**CI/CD**
- GitHub Actions — build e release automático por tag

---

## 🚀 CI/CD — Release Automático

O projeto usa GitHub Actions para gerar e publicar o instalador automaticamente.

Para lançar uma nova versão:

```bash
git tag v1.x.x
git push --tags
```

O workflow vai:
1. Instalar dependências
2. Gerar o Prisma Client
3. Compilar o backend Python com o engine embutido
4. Fazer o build do frontend
5. Gerar o instalador
6. Publicar automaticamente no GitHub Releases

---

## 🖥️ Rodando em modo desenvolvimento

### Pré-requisitos
- Node.js 20+
- Python 3.11+

### 1. Configurando o Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
prisma generate
prisma db push
```

Crie o arquivo `backend/.env`:
```
DATABASE_URL="sua_url_do_banco_postgresql"
```

### 2. Configurando o Frontend

```bash
npm install
```

Crie o arquivo `.env` na raiz do projeto:
```
VITE_API_URL=http://localhost:8000
```

### 3. Rodando o app

```bash
# Terminal 1 — backend
cd backend
.venv\Scripts\Activate.ps1
python main.py

# Terminal 2 — frontend + Electron
npm run build
npx electron .
```

### 4. Gerando o instalador manualmente

```bash
npm run dist-app
```

O instalador será gerado em `dist/Bodega Digital Setup x.x.x.exe`.

---

## 📁 Estrutura do Projeto

```
comunidade-vendas/
├── .github/
│   └── workflows/
│       └── release.yml         # CI/CD GitHub Actions
├── backend/
│   ├── main.py                 # API FastAPI
│   ├── schema.prisma           # Modelagem do banco
│   ├── requirements.txt        # Dependências Python
│   └── .env                    # Variáveis de ambiente (não commitado)
├── prisma-engines/
│   └── query-engine-windows.exe  # Binário do Prisma para Windows
├── src/
│   ├── pages/                  # Login, Dashboard, Estoque, Vendas, Cadastro, Usuários
│   ├── components/             # Header
│   ├── context/                # AuthContext, DataContext
│   └── api.ts                  # Configuração do Axios
├── electron.cjs                # Configuração do Electron
├── package.json
└── vite.config.ts
```

---

## ⚠️ Observações

- O banco de dados é hospedado na nuvem ([Supabase](https://supabase.com)), portanto é necessário internet para usar o app.
- A conexão usa o **Connection Pooler do Supabase (porta 6543)** para garantir compatibilidade com qualquer rede.
- O backend Python é compilado como `.exe` via PyInstaller e já vem incluído no instalador.
- O binário do Prisma (`query-engine-windows.exe`) é embutido no backend compilado automaticamente pelo CI/CD.
- Para o CI/CD funcionar, configure o secret `DATABASE_URL` em `Settings → Secrets → Actions` no GitHub.
