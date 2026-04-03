const sentimentService = require('../services/sentimentService');
const logger = require('../config/logger');

class SentimentController {
    async analisarSentimento(req, res, next) {
        try {
            const { moeda } = req.params;
            const resultado = await sentimentService.analisarSentimentoNoticias(moeda);

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na análise de sentimento:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async correlacionar(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 7 } = req.query;
            const resultado = await sentimentService.correlacionarComVariacao(moeda, parseInt(dias));

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na correlação:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async relatorioCompleto(req, res, next) {
        try {
            const { moeda } = req.params;
            const resultado = await sentimentService.gerarRelatorioCompleto(moeda);

            res.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro no relatório completo:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async analiseTempoReal(req, res, next) {
        try {
            const { moeda } = req.params;
            const cotacaoService = require('../services/cotacaoService');
            const cotacao = await cotacaoService.buscarCotacaoAtual(moeda);
            const sentimento = await sentimentService.analisarSentimentoNoticias(moeda);

            res.json({
                success: true,
                data: {
                    moeda,
                    cotacao_atual: cotacao?.bid || 0,
                    sentimento: sentimento.sentimento_geral,
                    score: sentimento.score_medio,
                    classificacao: sentimento.classificacao_geral,
                    ultima_atualizacao: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro na análise em tempo real:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SentimentController();