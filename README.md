# 🌵 Comunidade Gestor

Aplicação **desktop para Windows** desenvolvida para simplificar o controle de estoque, gerenciamento de inventário e lançamento de vendas de produtos artesanais. Desenvolvida com identidade visual nordestina, conta com sistema de login, controle por categorias, exportação de relatórios em PDF e CI/CD automatizado.

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
2. Compilar o backend Python
3. Fazer o build do frontend
4. Gerar o instalador
5. Publicar automaticamente no GitHub Releases

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
DATABASE_URL="sua_url_do_banco_postgresql"
VITE_API_URL=http://localhost:8000

### 3. Rodando o app

```bash
npm run build
npx electron .
```

### 4. Gerando o instalador manualmente

```bash
npm run dist-app
```

O instalador será gerado em `dist/Comunidade Gestor Setup 0.0.0.exe`.

---

## 📁 Estrutura do Projeto

```
comunidade-vendas/
├── .github/
│   └── workflows/
│       └── release.yml   # CI/CD GitHub Actions
├── backend/
│   ├── main.py           # API FastAPI
│   ├── schema.prisma     # Modelagem do banco
│   ├── requirements.txt  # Dependências Python
│   └── .env              # Variáveis de ambiente
├── prisma-engines/
│   └── query-engine-windows.exe  # Binário do Prisma
├── src/
│   ├── pages/            # Início, Estoque, Vendas, Cadastro, Usuários, Login
│   ├── components/       # Header
│   ├── context/          # AuthContext, DataContext
│   └── api.ts            # Configuração do Axios
├── electron.cjs          # Configuração do Electron
├── package.json
└── vite.config.ts
```

---

## ⚠️ Observações

- O banco de dados é hospedado na nuvem ([Supabase](https://supabase.com)), portanto é necessário internet para usar o app.
- O backend Python é compilado como `.exe` via PyInstaller e já vem incluído no instalador.
- O binário do Prisma (`query-engine-windows.exe`) é incluído automaticamente no instalador.
- Para CI/CD funcionar, configure o secret `DATABASE_URL` em `Settings → Secrets → Actions` no GitHub.
