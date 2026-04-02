const Redis = require('ioredis');
const logger = require('./logger');

// Configuração do Redis
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
};

let redisClient = null;
let isRedisAvailable = false;

// Função para conectar ao Redis
const connectRedis = async () => {
    try {
        redisClient = new Redis(redisConfig);

        redisClient.on('connect', () => {
            logger.info('✅ Redis conectado com sucesso');
            isRedisAvailable = true;
        });

        redisClient.on('error', (error) => {
            logger.error(`❌ Redis erro: ${error.message}`);
            isRedisAvailable = false;
        });

        redisClient.on('close', () => {
            logger.warn('⚠️ Redis conexão fechada');
            isRedisAvailable = false;
        });

        // Testar conexão
        await redisClient.ping();

        return redisClient;
    } catch (error) {
        logger.error(`❌ Falha ao conectar Redis: ${error.message}`);
        logger.warn('⚠️ Sistema continuará sem cache Redis');
        isRedisAvailable = false;
        return null;
    }
};

// Função para obter cliente Redis
const getRedisClient = () => redisClient;

// Verificar se Redis está disponível
const isRedisReady = () => isRedisAvailable && redisClient && redisClient.status === 'ready';

// Funções de cache
const cache = {
    // Obter valor do cache
    async get(key) {
        if (!isRedisReady()) return null;
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`Erro ao ler cache: ${error.message}`);
            return null;
        }
    },

    // Definir valor no cache com TTL (em segundos)
    async set(key, value, ttl = 300) {
        if (!isRedisReady()) return false;
        try {
            await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
            return true;
        } catch (error) {
            logger.error(`Erro ao escrever cache: ${error.message}`);
            return false;
        }
    },

    // Deletar cache
    async del(key) {
        if (!isRedisReady()) return false;
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error(`Erro ao deletar cache: ${error.message}`);
            return false;
        }
    },

    // Deletar múltiplas chaves por padrão
    async delPattern(pattern) {
        if (!isRedisReady()) return false;
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
            return true;
        } catch (error) {
            logger.error(`Erro ao deletar cache por padrão: ${error.message}`);
            return false;
        }
    },

    // Limpar cache de cotações
    async limparCacheCotacoes() {
        return await this.delPattern('cotacao:*');
    },

    // Limpar cache do dashboard
    async limparCacheDashboard() {
        return await this.delPattern('dashboard:*');
    },

    // Limpar todos os caches
    async limparTodos() {
        if (!isRedisReady()) return false;
        try {
            await redisClient.flushdb();
            logger.info('🗑️ Cache Redis completamente limpo');
            return true;
        } catch (error) {
            logger.error(`Erro ao limpar cache: ${error.message}`);
            return false;
        }
    },

    // Obter estatísticas do cache
    async getStats() {
        if (!isRedisReady()) return null;
        try {
            const info = await redisClient.info('stats');
            const keys = await redisClient.keys('*');
            return {
                total_keys: keys.length,
                keys: keys,
                info: info,
                isAvailable: true
            };
        } catch (error) {
            logger.error(`Erro ao obter stats: ${error.message}`);
            return { isAvailable: false, error: error.message };
        }
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    isRedisReady,
    cache
};