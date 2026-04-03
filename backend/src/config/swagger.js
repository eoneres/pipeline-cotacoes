const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pipeline de Cotações API',
            version: '1.0.0',
            description: `
        API completa para monitoramento, análise e previsão de cotações de moedas.
        
        ## Funcionalidades
        - 📈 Cotações em tempo real
        - 🔔 Alertas configuráveis
        - 🤖 Previsões com Machine Learning
        - 🧠 Análise de Sentimento
        - 📊 Exportação de dados
        - 💾 Cache com Redis
        - 🔌 WebSocket para atualizações ao vivo
      `,
            contact: {
                name: 'Pipeline de Cotações',
                url: 'https://github.com/seu-usuario/pipeline-cotacoes'
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
                url: 'https://api.pipeline-cotacoes.com',
                description: 'Servidor de Produção'
            }
        ],
        tags: [
            { name: 'Cotações', description: 'Endpoints de cotações de moedas' },
            { name: 'Coletas', description: 'Gerenciamento de coleta de dados' },
            { name: 'Dashboard', description: 'Métricas e resumos' },
            { name: 'Alertas', description: 'Sistema de alertas configuráveis' },
            { name: 'Previsões', description: 'Machine Learning e previsões' },
            { name: 'Sentimento', description: 'Análise de sentimento de notícias' },
            { name: 'Exportação', description: 'Exportação de dados' },
            { name: 'Cache', description: 'Gerenciamento de cache Redis' }
        ],
        components: {
            schemas: {
                Cotacao: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'ID único' },
                        moeda: { type: 'string', description: 'Par de moedas (ex: USD-BRL)', example: 'USD-BRL' },
                        bid: { type: 'number', description: 'Preço de compra', example: 5.1234 },
                        ask: { type: 'number', description: 'Preço de venda', example: 5.1245 },
                        high: { type: 'number', description: 'Máxima do dia', example: 5.1300 },
                        low: { type: 'number', description: 'Mínima do dia', example: 5.1200 },
                        pctChange: { type: 'number', description: 'Variação percentual', example: 0.22 },
                        timestamp: { type: 'string', format: 'date-time', description: 'Data/hora da cotação' }
                    }
                },
                Alerta: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nome: { type: 'string', example: 'USD acima de 5.70' },
                        moeda: { type: 'string', example: 'USD-BRL' },
                        tipo: { type: 'string', enum: ['above', 'below', 'percent_change'] },
                        valor: { type: 'number', example: 5.70 },
                        canal: { type: 'string', enum: ['console', 'email', 'webhook'] },
                        destinatario: { type: 'string', example: 'user@email.com' }
                    }
                },
                Previsao: {
                    type: 'object',
                    properties: {
                        moeda: { type: 'string' },
                        dias_previsao: { type: 'integer' },
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
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'] // Caminho para os arquivos de rota
};

module.exports = swaggerJsdoc(options);