require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { prisma } = require('./config/database');
const logger = require('./config/logger');
const coletaJob = require('./jobs/coletaJob');

// Importação das rotas
const cotacaoRoutes = require('./routes/cotacaoRoutes');
const coletaRoutes = require('./routes/coletaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const exportRoutes = require('./routes/exportRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
// Inicialização
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log de requisições
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
});

// Rotas
app.use('/api/cotacoes', cotacaoRoutes);
app.use('/api/coletas', coletaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/forecast', forecastRoutes);

// Rota /api/health para compatibilidade
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// Rota /api para compatibilidade
app.get('/api', (req, res) => {
    res.json({
        name: 'Pipeline de Cotações API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            health: '/api/health',
            cotacoes: '/api/cotacoes',
            coletas: '/api/coletas',
            dashboard: '/api/dashboard'
        },
        timestamp: new Date().toISOString()
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        name: 'Pipeline de Cotações API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            cotacoes: '/api/cotacoes',
            coletas: '/api/coletas',
            dashboard: '/api/dashboard'
        }
    });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    logger.error('Erro não tratado:', err);

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Erro interno do servidor',
            status: err.status || 500,
            timestamp: new Date().toISOString()
        }
    });
});

// Função para inicializar o servidor
async function startServer() {
    try {
        // Testar conexão com o banco
        await prisma.$connect();
        logger.info('✅ Conectado ao banco de dados');

        // Iniciar jobs (apenas se não for ambiente de teste)
        if (process.env.NODE_ENV !== 'test') {
            coletaJob.start();
            const alertaJob = require('./jobs/alertaJob');
            alertaJob.start();
            logger.info('📊 Jobs iniciados: Coleta e Alertas');
        }

        // Iniciar o job de alertas
        const alertaJob = require('./jobs/alertaJob');
        if (process.env.NODE_ENV !== 'test') {
            alertaJob.start();
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            logger.info(`
      🚀 Servidor rodando!
      📡 URL: http://localhost:${PORT}
      🌍 Ambiente: ${process.env.NODE_ENV}
      📅 Iniciado em: ${new Date().toISOString()}
      `);
        });
    } catch (error) {
        logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('\n🛑 Recebido SIGINT. Encerrando servidor...');
    coletaJob.stop();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('\n🛑 Recebido SIGTERM. Encerrando servidor...');
    coletaJob.stop();
    await prisma.$disconnect();
    process.exit(0);
});

// Iniciar aplicação
startServer();

module.exports = app; // Exportar para testes