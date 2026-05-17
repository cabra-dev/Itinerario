# 📦 Comunidade Gestor
Uma aplicação web Full-Stack desenvolvida para simplificar o controle de estoque, gerenciamento de inventário e lançamento de vendas de produtos. O sistema conta com validações robustas de segurança (anti-valores negativos), interface responsiva de alto contraste e exportação de relatórios nativos em PDF.

# 🎯 Objetivo do Projeto
O objetivo principal do Comunidade Gestor é oferecer uma ferramenta de controle interno centralizada e intuitiva para microempreendedores ou comunidades. Ele resolve o problema de perda de controle de insumos através de um fluxo automatizado: ao lançar uma venda, o estoque é baixado em tempo real usando transações seguras no banco de dados, recalculando o faturamento e o patrimônio total instantaneamente no Dashboard.

🛠️ Tecnologias Utilizadas
Frontend
React (TypeScript) + Vite

React Router Dom (Gerenciamento de rotas)

Context API (Gerenciamento de estado global)

Axios (Integração HTTP)

jsPDF & jsPDF-AutoTable (Geração de relatórios)

Backend
FastAPI (Python 3)

Prisma ORM (Modelagem e consultas ao banco)

Uvicorn (Servidor ASGI)

Pydantic (Validação e sanitização de dados)

🚀 Sequência de Instalação e Execução
1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:

Node.js (versão 18 ou superior)

Python (versão 3.10 ou superior)

2. Configurando o Backend
Abra o terminal na pasta raiz do repositório do backend e siga os passos abaixo:

Bash
# Entrar na pasta do backend (se aplicável)
cd backend

# Criar o ambiente virtual do Python
python -m venv .venv

# Ativar o ambiente virtual
No Windows (Command Prompt):

.venv\Scripts\activate

No Windows (PowerShell):

.venv\Scripts\Activate.ps1

No Mac/Linux:

source .venv/bin/activate

# Instalar as dependências do projeto
pip install -r requirements.txt

# Gerar o cliente do Prisma ORM
python -m prisma generate

# Sincronizar as tabelas com o banco de dados local
python -m prisma db push

# Iniciar o servidor backend
python main.py
O servidor backend estará rodando em: http://localhost:8000

3. Configurando o Frontend
Abra um novo terminal na pasta raiz do repositório do frontend:

Bash
# Instalar os pacotes e dependências do Node
npm install
Antes de iniciar, crie um arquivo chamado .env na raiz da pasta do frontend para apontar para o seu servidor local:

Plaintext
VITE_API_URL=http://localhost:8000
Agora, inicie o servidor de desenvolvimento do React:

Bash
# Iniciar a aplicação localmente
npm run dev
O frontend estará acessível através do endereço fornecido no terminal (geralmente http://localhost:5173).
