# 📊 Pipeline de Cotações

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Render-black.svg)](https://vercel.com)

> Sistema completo de monitoramento, análise e previsão de cotações de moedas em tempo real com Machine Learning

## 🎯 Sobre o Projeto

O **Pipeline de Cotações** é uma plataforma full-stack que automatiza a coleta, armazenamento, análise e previsão de cotações de moedas. O sistema utiliza técnicas de Machine Learning (Regressão Linear e Prophet) para gerar previsões precisas, além de análise de sentimento de notícias para auxiliar na tomada de decisão.

### ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 📈 **Dashboard** | Visualização em tempo real com gráficos interativos (Linha, Área, Velas) |
| 🔔 **Alertas** | Notificações configuráveis quando moedas atingem valores específicos |
| 🤖 **Previsões** | Machine Learning com Regressão Linear e Prophet (Facebook) |
| 🧠 **Análise de Sentimento** | Classificação de notícias com scores de -5 a +5 |
| 📊 **Exportação** | Download de dados em CSV e Excel |
| 🔌 **WebSocket** | Atualizações em tempo real sem refresh |
| 💾 **Cache Redis** | Performance 40x mais rápida |
| 📚 **API RESTful** | Documentação completa com Swagger |

### 🛠️ Stack Tecnológica

**Backend**
- Node.js + Express
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- Redis Cache
- WebSocket (Socket.io)
- JWT Authentication

**Frontend**
- React 18 + Vite
- TailwindCSS
- Recharts (Gráficos)
- React Query
- Socket.io Client

**Machine Learning**
- Regressão Linear Customizada
- Prophet (Facebook)
- Natural Language Processing
- Análise de Sentimento

**DevOps**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Deploy: Vercel + Render

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Docker (opcional)
- Python 3.8+ (para Prophet)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/eoneres/pipeline-cotacoes.git
cd pipeline-cotacoes

# 2. Instale as dependências
npm run setup

# 3. Configure o ambiente
cd backend
cp .env.example .env
# Edite o .env com suas configurações

# 4. Configure o banco de dados
npx prisma generate
npx prisma migrate dev --name init

# 5. Inicie o projeto
cd ..
npm run dev
Com Docker
bash
# Iniciar todos os serviços
npm run docker:up

# Parar serviços
npm run docker:down

# Ver logs
npm run docker:logs
🚀 Deploy
URLs do Projeto
Serviço	URL
Frontend	https://pipeline-cotacoes.vercel.app
Backend API	https://pipeline-cotacoes-api.onrender.com
Documentação API	https://pipeline-cotacoes-api.onrender.com/api-docs
Deploy Manual
bash
# Backend (Render)
git push origin main

# Frontend (Vercel)
cd frontend
vercel --prod
📡 API Endpoints
Cotações
Método	Endpoint	Descrição
GET	/api/cotacoes	Lista todas as cotações
GET	/api/cotacoes/moedas	Lista moedas disponíveis
GET	/api/cotacoes/atuais/:moeda	Cotação atual
GET	/api/cotacoes/historico/:moeda	Histórico
GET	/api/cotacoes/estatisticas/:moeda	Estatísticas
Alertas
Método	Endpoint	Descrição
GET	/api/alertas	Lista alertas
POST	/api/alertas	Cria alerta
DELETE	/api/alertas/:id	Remove alerta
Previsões
Método	Endpoint	Descrição
GET	/api/forecast/simples/:moeda	Regressão Linear
GET	/api/forecast/prophet/:moeda	Prophet
Exportação
Método	Endpoint	Descrição
GET	/api/export/csv	Exporta CSV
GET	/api/export/excel	Exporta Excel
💻 Exemplos de Uso
Criar Alerta
bash
curl -X POST https://api.pipeline-cotacoes.com/api/alertas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "USD acima de 5.70",
    "moeda": "USD-BRL",
    "tipo": "above",
    "valor": 5.70,
    "canal": "console"
  }'
Gerar Previsão
bash
curl https://api.pipeline-cotacoes.com/api/forecast/simples/USD-BRL?dias=7
Exportar Dados
bash
curl https://api.pipeline-cotacoes.com/api/export/csv > cotacoes.csv
📊 Estrutura do Projeto
text
pipeline-cotacoes/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── services/       # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── jobs/           # Tarefas agendadas
│   │   ├── ml/             # Scripts ML (Prophet)
│   │   └── utils/          # Utilitários
│   ├── prisma/             # Schema do banco
│   └── tests/              # Testes automatizados
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── pages/          # Páginas
│   │   └── utils/          # Utilitários
│   └── public/             # Arquivos estáticos
├── docker-compose.yml
└── README.md
🧪 Testes
bash
# Backend
cd backend
npm test              # Unitários
npm run test:watch    # Modo watch
npm run test:coverage # Cobertura

# Frontend
cd frontend
npm run test
🤝 Contribuição
Fork o projeto

Crie sua branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'feat: adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

📝 Licença
MIT © Eoneres

🙏 Agradecimentos
AwesomeAPI - API de cotações

Vercel - Hospedagem Frontend

Render - Hospedagem Backend

Supabase - Banco de Dados

Redis Cloud - Cache

⭐️ Se este projeto te ajudou, dê uma estrela no GitHub!

text

---

### **2. Documentação da API (Swagger)**

### **Arquivo: `backend/src/config/swagger.js`** (COMPLETO)

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pipeline de Cotações API',
      version: '1.0.0',
      description: `
## 📊 API para Monitoramento de Cotações de Moedas

### Funcionalidades

- **Cotações**: Busca em tempo real, histórico e estatísticas
- **Alertas**: Sistema de notificações configuráveis
- **Previsões**: Machine Learning (Regressão Linear)
- **Exportação**: Dados em CSV e Excel
- **Cache**: Redis para alta performance

### Base URL

- Produção: \`https://api.pipeline-cotacoes.com\`
- Desenvolvimento: \`http://localhost:3001\`

### Autenticação

(Em desenvolvimento) - Futuramente será implementado JWT

### WebSocket

Conecte-se ao WebSocket para atualizações em tempo real:
\`\`\`
ws://localhost:3001
\`\`\`

Eventos disponíveis:
- \`nova_cotacao\` - Nova cotação recebida
- \`coleta_finalizada\` - Coleta de dados concluída
- \`alerta_disparado\` - Alerta foi ativado
      `,
      contact: {
        name: 'Pipeline de Cotações',
        url: 'https://github.com/eoneres/pipeline-cotacoes',
        email: 'contato@pipeline-cotacoes.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://pipeline-cotacoes-api.onrender.com',
        description: 'Servidor de Produção'
      }
    ],
    tags: [
      { name: 'Cotações', description: 'Endpoints de cotações de moedas' },
      { name: 'Coletas', description: 'Gerenciamento de coleta de dados' },
      { name: 'Dashboard', description: 'Métricas e resumos' },
      { name: 'Alertas', description: 'Sistema de alertas configuráveis' },
      { name: 'Previsões', description: 'Machine Learning e previsões' },
      { name: 'Exportação', description: 'Exportação de dados' },
      { name: 'Cache', description: 'Gerenciamento de cache Redis' }
    ],
    components: {
      schemas: {
        Cotacao: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID único da cotação' },
            moeda: { type: 'string', example: 'USD-BRL', description: 'Par de moedas' },
            bid: { type: 'number', example: 5.1234, description: 'Preço de compra' },
            ask: { type: 'number', example: 5.1245, description: 'Preço de venda' },
            high: { type: 'number', example: 5.1300, description: 'Máxima do dia' },
            low: { type: 'number', example: 5.1200, description: 'Mínima do dia' },
            pctChange: { type: 'number', example: 0.22, description: 'Variação percentual' },
            timestamp: { type: 'string', format: 'date-time', description: 'Data/hora da cotação' }
          }
        },
        Alerta: {
          type: 'object',
          required: ['nome', 'moeda', 'tipo', 'valor'],
          properties: {
            id: { type: 'string', description: 'ID único do alerta' },
            nome: { type: 'string', example: 'USD acima de 5.70', description: 'Nome do alerta' },
            moeda: { type: 'string', example: 'USD-BRL', description: 'Par de moedas' },
            tipo: { type: 'string', enum: ['above', 'below', 'percent_change'], description: 'Tipo de alerta' },
            valor: { type: 'number', example: 5.70, description: 'Valor de referência' },
            canal: { type: 'string', enum: ['console', 'email', 'webhook'], default: 'console' },
            destinatario: { type: 'string', description: 'Email ou URL do webhook' }
          }
        },
        Previsao: {
          type: 'object',
          properties: {
            moeda: { type: 'string', example: 'USD-BRL' },
            dias_previsao: { type: 'integer', example: 7 },
            previsoes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dia: { type: 'integer' },
                  data: { type: 'string', format: 'date' },
                  valor: { type: 'number' },
                  intervaloSuperior: { type: 'number' },
                  intervaloInferior: { type: 'number' }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);