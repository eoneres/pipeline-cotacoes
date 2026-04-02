# 📊 Pipeline de Cotações

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Sobre o Projeto

Pipeline ETL completo para coleta, armazenamento, análise e previsão de cotações de moedas. O sistema coleta dados automaticamente da AwesomeAPI, armazena em banco de dados SQLite/PostgreSQL, e disponibiliza um dashboard interativo com gráficos, alertas configuráveis e previsões baseadas em Machine Learning.

## ✨ Funcionalidades

### 📈 Dashboard
- Cotações em tempo real com cards interativos
- Gráficos dinâmicos (Linha, Área, Velas)
- Métricas de performance (média, volatilidade, amplitude)
- Histórico completo com tabela detalhada
- Exportação de dados (CSV/Excel)

### 🔔 Alertas Inteligentes
- Alertas por valor (acima/abaixo)
- Alertas por variação percentual
- Múltiplos canais (Console, Webhook)
- Histórico de notificações

### 🤖 Previsões com Machine Learning
- Regressão Linear para projeções
- Média Móvel para tendências
- Comparação entre métodos
- Métricas de acurácia (R², MAE)
- Análise de tendência e recomendações

### 🔄 Pipeline ETL
- Coleta automática a cada 5 minutos
- Coleta manual sob demanda
- Logs detalhados de execução
- Tratamento de dados e validação

## 🛠️ Tecnologias

### Backend
- **Node.js** + **Express** - API RESTful
- **Prisma ORM** - Modelagem e acesso a dados
- **SQLite** (dev) / **PostgreSQL** (prod)
- **node-cron** - Agendamento de tarefas
- **Axios** - Requisições HTTP

### Frontend
- **React 18** + **Vite** - Interface moderna
- **TailwindCSS** - Estilização
- **Recharts** - Gráficos interativos
- **React Query** - Gerenciamento de estado

### Machine Learning
- Regressão Linear customizada
- Cálculo de R² e MAE
- Análise de tendências

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pipeline-cotacoes.git
cd pipeline-cotacoes

# 2. Instale as dependências
npm run setup

# 3. Configure o ambiente
cd backend
cp .env.example .env

# 4. Configure o banco de dados
npx prisma generate
npx prisma migrate dev --name init

# 5. Inicie o projeto
cd ..
npm run dev

Acesse:

Frontend: http://localhost:3000

Backend API: http://localhost:3001

🐳 Executando com Docker

# Build e iniciar containers
npm run docker:up

# Parar containers
npm run docker:down

# Ver logs
npm run docker:logs

📡 API Endpoints
Cotações
GET /api/cotacoes - Listar cotações

GET /api/cotacoes/atuais/:moeda - Cotação atual

GET /api/cotacoes/historico/:moeda - Histórico

GET /api/cotacoes/estatisticas/:moeda - Estatísticas

Alertas
GET /api/alertas - Listar alertas

POST /api/alertas - Criar alerta

DELETE /api/alertas/:id - Remover alerta

Previsões
GET /api/forecast/simples/:moeda - Previsão por regressão

GET /api/forecast/media-movel/:moeda - Previsão por média móvel

GET /api/forecast/comparar/:moeda - Comparar métodos

Exportação
GET /api/export/csv - Exportar CSV

GET /api/export/excel - Exportar Excel

GET /api/export/relatorio - Relatório resumo

📊 Exemplos de Uso

Criar um Alerta

curl -X POST http://localhost:3001/api/alertas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "USD acima de 5.70",
    "moeda": "USD-BRL",
    "tipo": "above",
    "valor": 5.70,
    "canal": "console"
  }'

  Gerar Previsão

  curl http://localhost:3001/api/forecast/simples/USD-BRL?dias=7

  Exportar Dados

  curl http://localhost:3001/api/export/csv > cotacoes.csv

  🧪 Testes

  # Testes unitários
cd backend
npm test

# Testes com cobertura
npm run test:coverage

# Modo watch
npm run test:watch

📁 Estrutura do Projeto

pipeline-cotacoes/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── jobs/
│   │   └── utils/
│   ├── prisma/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
├── docker-compose.yml
└── README.md

🤝 Contribuição
Fork o projeto

Crie sua branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'feat: adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
Seu Filipe Neres Fernandes - @eoneres

🙏 Agradecimentos
AwesomeAPI - API de cotações

Vite - Build tool

TailwindCSS - Framework CSS


⭐️ Se este projeto te ajudou, dê uma estrela no GitHub!
---

## 🚀 Comandos para Subir ao GitHub

Execute os comandos na raiz do projeto:

```bash
# 1. Verificar o status dos arquivos
git status

# 2. Adicionar todos os arquivos
git add .

# 3. Verificar o que será commitado
git status

# 4. Criar o commit
git commit -m "feat: Pipeline de Cotações completo

- Implementação completa do pipeline ETL
- Dashboard com gráficos interativos
- Sistema de alertas configuráveis
- Previsões com Machine Learning
- Exportação de dados (CSV/Excel)
- Interface moderna com React + Tailwind
- API RESTful documentada
- Testes unitários e de integração"

# 5. Se for o primeiro commit, adicionar a origem remota
git remote add origin https://github.com/SEU_USUARIO/pipeline-cotacoes.git

# 6. Enviar para o GitHub
git push -u origin main
# ou se a branch for master
git push -u origin master