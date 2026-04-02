const express = require('express');
const router = express.Router();
const { cache, isRedisReady } = require('../config/redis');
const logger = require('../config/logger');

// Listar estatísticas do cache
router.get('/stats', async (req, res) => {
    try {
        const stats = await cache.getStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Erro ao obter stats do cache:', error);
        res.status(500).json({ error: error.message });
    }
});

// Limpar todo o cache
router.delete('/clear', async (req, res) => {
    try {
        await cache.limparTodos();
        res.json({
            success: true,
            message: 'Cache limpo com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Erro ao limpar cache:', error);
        res.status(500).json({ error: error.message });
    }
});

// Limpar cache de cotações
router.delete('/clear/cotacoes', async (req, res) => {
    try {
        await cache.limparCacheCotacoes();
        res.json({
            success: true,
            message: 'Cache de cotações limpo com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Erro ao limpar cache de cotações:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verificar status do Redis
router.get('/status', async (req, res) => {
    res.json({
        success: true,
        redis_available: isRedisReady(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;