require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const { prisma } = require('./config/database');
const logger = require('./config/logger');
const coletaJob = require('./jobs/coletaJob');
const alertaJob = require('./jobs/alertaJob');
const { connectRedis, cache } = require('./config/redis');

// Importação das rotas
const cotacaoRoutes = require('./routes/cotacaoRoutes');
const coletaRoutes = require('./routes/coletaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const exportRoutes = require('./routes/exportRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const cacheRoutes = require('./routes/cacheRoutes');

// Inicialização
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
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
app.use('/api/cache', cacheRoutes);

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
            dashboard: '/api/dashboard',
            alertas: '/api/alertas',
            export: '/api/export',
            forecast: '/api/forecast'
        },
        websocket: {
            status: 'online',
            endpoint: 'ws://localhost:3001'
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
            api: '/api',
            cotacoes: '/api/cotacoes',
            coletas: '/api/coletas',
            dashboard: '/api/dashboard',
            alertas: '/api/alertas',
            export: '/api/export',
            forecast: '/api/forecast'
        },
        websocket: {
            status: 'online',
            endpoint: 'ws://localhost:3001',
            events: ['nova_cotacao', 'coleta_finalizada', 'alerta_disparado']
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

// ============= WEBSOCKET CONFIGURAÇÃO =============

// Armazenar clientes conectados
const connectedClients = new Set();

io.on('connection', (socket) => {
    connectedClients.add(socket.id);
    logger.info(`🔌 Cliente conectado: ${socket.id} | Total: ${connectedClients.size}`);

    // Enviar boas-vindas
    socket.emit('welcome', {
        message: 'Conectado ao Pipeline de Cotações WebSocket',
        timestamp: new Date().toISOString(),
        clientId: socket.id
    });

    // Cliente pode solicitar dados específicos
    socket.on('subscribe', (data) => {
        const { moeda, tipo } = data;
        logger.debug(`📡 Cliente ${socket.id} inscrito em ${tipo}: ${moeda || 'todas'}`);
        socket.join(`${tipo}_${moeda || 'all'}`);
    });

    socket.on('unsubscribe', (data) => {
        const { moeda, tipo } = data;
        socket.leave(`${tipo}_${moeda || 'all'}`);
    });

    socket.on('disconnect', () => {
        connectedClients.delete(socket.id);
        logger.info(`🔌 Cliente desconectado: ${socket.id} | Total: ${connectedClients.size}`);
    });
});

// Função para emitir nova cotação para todos os clientes
function emitirNovaCotacao(cotacao) {
    io.emit('nova_cotacao', {
        tipo: 'nova_cotacao',
        dados: cotacao,
        timestamp: new Date().toISOString()
    });
    logger.debug(`📤 Emitindo nova cotação: ${cotacao.moeda} - R$ ${cotacao.bid}`);
}

// Função para emitir coleta finalizada
function emitirColetaFinalizada(log) {
    io.emit('coleta_finalizada', {
        tipo: 'coleta_finalizada',
        dados: log,
        timestamp: new Date().toISOString()
    });
    logger.info(`📤 Coleta finalizada: ${log.registros} registros salvos`);
}

// Função para emitir alerta disparado
function emitirAlerta(alerta) {
    io.emit('alerta_disparado', {
        tipo: 'alerta_disparado',
        dados: alerta,
        timestamp: new Date().toISOString()
    });
    logger.info(`🔔 Alerta disparado: ${alerta.nome}`);
}

// Exportar funções para uso em outros módulos
module.exports.emitirNovaCotacao = emitirNovaCotacao;
module.exports.emitirColetaFinalizada = emitirColetaFinalizada;
module.exports.emitirAlerta = emitirAlerta;

// ============= FUNÇÃO PARA MONITORAR NOVAS COTAÇÕES =============

// Monitorar o banco de dados em busca de novas cotações
let ultimaCotacaoTimestamp = null;

async function monitorarNovasCotations() {
    try {
        const ultimaCotacao = await prisma.cotacao.findFirst({
            orderBy: { timestamp: 'desc' }
        });

        if (ultimaCotacao && (!ultimaCotacaoTimestamp || ultimaCotacao.timestamp > ultimaCotacaoTimestamp)) {
            ultimaCotacaoTimestamp = ultimaCotacao.timestamp;
            emitirNovaCotacao(ultimaCotacao);
        }
    } catch (error) {
        logger.error('Erro ao monitorar novas cotações:', error);
    }
}

// Verificar novas cotações a cada 30 segundos
setInterval(monitorarNovasCotations, 30000);

// ============= INICIAR SERVIDOR =============

async function startServer() {
    try {
        // Conectar ao Redis
        await connectRedis();

        // Testar conexão com o banco
        await prisma.$connect();
        logger.info('✅ Conectado ao banco de dados');

        // Iniciar jobs
        if (process.env.NODE_ENV !== 'test') {
            coletaJob.start();
            alertaJob.start();
            logger.info('📊 Jobs iniciados: Coleta e Alertas');
        }

        // Iniciar servidor
        server.listen(PORT, () => {
            logger.info(`
      🚀 Servidor rodando!
      📡 HTTP: http://localhost:${PORT}
      🔌 WebSocket: ws://localhost:${PORT}
      💾 Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}
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
    alertaJob.stop();
    io.close();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('\n🛑 Recebido SIGTERM. Encerrando servidor...');
    coletaJob.stop();
    alertaJob.stop();
    io.close();
    await prisma.$disconnect();
    process.exit(0);
});

// Iniciar aplicação
startServer();

module.exports = { app, server, io };