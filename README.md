# 🧶 Comunidade Gestor

Aplicação **desktop para Windows** desenvolvida para simplificar o controle de estoque, gerenciamento de inventário e lançamento de vendas de produtos artesanais. Conta com validações de segurança, interface de alto contraste e exportação de relatórios em PDF.

---

## 🎯 Objetivo

O Comunidade Gestor foi criado para atender pequenos grupos de artesanato, oferecendo uma ferramenta centralizada e intuitiva. Ao lançar uma venda, o estoque é baixado em tempo real usando transações seguras no banco de dados, recalculando o faturamento e o patrimônio total instantaneamente no Dashboard.

---

## 💻 Instalação (usuário final)

1. Acesse a página de [Releases](https://github.com/cabra-dev/Itinerario/releases)
2. Baixe o arquivo `Comunidade Gestor Setup 0.0.0.exe`
3. Execute e siga a instalação normalmente
4. Abra o app pelo atalho criado no Desktop

> ⚠️ É necessário conexão com a internet, pois o banco de dados é online.

---

## 🛠️ Tecnologias

**Desktop**
- Electron — empacotamento como app desktop Windows

**Frontend**
- React (TypeScript) + Vite
- React Router Dom (HashRouter)
- Context API
- Axios
- jsPDF & jsPDF-AutoTable

**Backend**
- FastAPI (Python 3)
- Prisma ORM + PostgreSQL (Neon)
- Uvicorn
- Pydantic
- PyInstaller

---

## 🚀 Rodando em modo desenvolvimento

### Pré-requisitos
- Node.js 18+
- Python 3.10+

### 1. Configurando o Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m prisma generate
python -m prisma db push
```

Crie o arquivo `backend/.env`:

DATABASE_URL="sua_url_do_banco_postgresql"

### 2. Configurando o Frontend

```bash
npm install
```

Crie o arquivo `.env` na raiz do projeto:
VITE_API_URL=http://localhost:8000

### 3. Rodando o app

```bash
npm run build
npx electron .
```

### 4. Gerando o instalador

```bash
npm run dist-app
```

O instalador será gerado em `dist/Comunidade Gestor Setup 0.0.0.exe`.

---

## 📁 Estrutura do Projeto
comunidade-vendas/
├── backend/
│   ├── main.py           # API FastAPI
│   ├── schema.prisma     # Modelagem do banco
│   ├── requirements.txt  # Dependências Python
│   └── .env              # Variáveis de ambiente
├── src/
│   ├── pages/            # Dashboard, Inventário, Vendas, Cadastro
│   ├── components/       # Header
│   ├── context/          # DataContext
│   └── api.ts            # Configuração do Axios
├── electron.cjs          # Configuração do Electron
├── package.json
└── vite.config.ts

---

## ⚠️ Observações

- O banco de dados é hospedado na nuvem ([Neon](https://neon.tech)), portanto é necessário internet para usar o app.
- O backend Python é compilado como `.exe` via PyInstaller e já vem incluído no instalador.