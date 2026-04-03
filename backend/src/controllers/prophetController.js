const prophetService = require('../services/prophetService');
const logger = require('../config/logger');

class ProphetController {
    /**
     * Previsão com Prophet
     */
    async preverComProphet(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 30 } = req.query;

            const resultado = await prophetService.preverComProphet(moeda, parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na previsão Prophet:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Comparar Prophet com Regressão Linear
     */
    async compararModelos(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 30 } = req.query;

            const resultado = await prophetService.compararModelos(moeda, parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na comparação:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Obter componentes da previsão
     */
    async obterComponentes(req, res, next) {
        try {
            const { moeda } = req.params;

            const resultado = await prophetService.obterComponentes(moeda);

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao obter componentes:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new ProphetController();