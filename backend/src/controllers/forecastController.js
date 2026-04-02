const forecastService = require('../services/forecastService');
const logger = require('../config/logger');

class ForecastController {
    /**
     * Previsão simples (Regressão Linear)
     */
    async previsaoSimples(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 7 } = req.query;

            const resultado = await forecastService.previsaoSimples(moeda, parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na previsão simples:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Previsão por Média Móvel
     */
    async previsaoMediaMovel(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 7, janela = 7 } = req.query;

            const resultado = await forecastService.previsaoMediaMovel(moeda, parseInt(janela), parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na previsão por média móvel:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Comparar métodos de previsão
     */
    async compararPrevisoes(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 7 } = req.query;

            const resultado = await forecastService.compararPrevisoes(moeda, parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na comparação de previsões:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new ForecastController();