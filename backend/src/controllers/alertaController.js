const alertaService = require('../services/alertaService');
const logger = require('../config/logger');

const alertaController = {
    async listar(req, res) {
        try {
            const { ativo } = req.query;
            const alertas = await alertaService.listarAlertas(ativo === 'true' ? true : ativo === 'false' ? false : null);

            res.json({
                success: true,
                data: alertas,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao listar alertas:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async criar(req, res) {
        try {
            const { nome, moeda, tipo, valor, canal, destinatario } = req.body;

            if (!nome || !moeda || !tipo || !valor) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos obrigatórios: nome, moeda, tipo, valor'
                });
            }

            const alerta = await alertaService.criarAlerta({
                nome,
                moeda,
                tipo,
                valor: parseFloat(valor),
                canal: canal || 'console',
                destinatario
            });

            res.json({
                success: true,
                data: alerta,
                message: 'Alerta criado com sucesso',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao criar alerta:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async remover(req, res) {
        try {
            const { id } = req.params;
            await alertaService.removerAlerta(id);

            res.json({
                success: true,
                message: 'Alerta removido com sucesso',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao remover alerta:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async listarNotificacoes(req, res) {
        try {
            const { limit = 50 } = req.query;
            const notificacoes = await alertaService.listarNotificacoes(limit);

            res.json({
                success: true,
                data: notificacoes,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao listar notificações:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = alertaController;