const cotacaoService = require('../services/cotacaoService');
const logger = require('../config/logger');

class CotacaoController {
    /**
     * Lista cotações com filtros
     */
    async listar(req, res, next) {
        try {
            const { moeda, startDate, endDate, limit, offset } = req.query;

            const resultado = await cotacaoService.buscarCotações({
                moeda,
                startDate,
                endDate,
                limit,
                offset
            });

            res.json({
                success: true,
                data: resultado.data,
                pagination: resultado.pagination,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao listar cotações:', error);
            next(error);
        }
    }

    /**
     * Busca cotação atual para uma moeda
     */
    async buscarAtual(req, res, next) {
        try {
            const { moeda } = req.params;

            const cotacao = await cotacaoService.buscarCotacaoAtual(moeda);

            if (!cotacao) {
                return res.status(404).json({
                    success: false,
                    error: 'Cotação não encontrada',
                    message: `Não foi possível obter cotação para ${moeda}`
                });
            }

            res.json({
                success: true,
                data: cotacao,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar cotação atual:', error);
            next(error);
        }
    }

    /**
     * Busca histórico de uma moeda
     */
    async buscarHistorico(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 30 } = req.query;

            const historico = await cotacaoService.buscarHistorico(moeda, parseInt(dias));

            res.json({
                success: true,
                data: historico,
                meta: {
                    moeda,
                    dias: parseInt(dias),
                    registros: historico.length,
                    data_inicio: historico[0]?.timestamp,
                    data_fim: historico[historico.length - 1]?.timestamp
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar histórico:', error);
            next(error);
        }
    }

    /**
     * Busca estatísticas de uma moeda
     */
    async buscarEstatisticas(req, res, next) {
        try {
            const { moeda } = req.params;
            const { dias = 30 } = req.query;

            const estatisticas = await cotacaoService.calcularEstatisticas(moeda, parseInt(dias));

            if (!estatisticas) {
                return res.status(404).json({
                    success: false,
                    error: 'Dados insuficientes',
                    message: `Não há dados suficientes para calcular estatísticas de ${moeda}`
                });
            }

            res.json({
                success: true,
                data: estatisticas,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar estatísticas:', error);
            next(error);
        }
    }

    /**
     * Lista moedas disponíveis
     */
    async listarMoedas(req, res, next) {
        try {
            const moedas = await cotacaoService.buscarMoedasDisponiveis();

            res.json({
                success: true,
                data: moedas,
                total: moedas.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao listar moedas:', error);
            next(error);
        }
    }

    /**
     * Compara duas moedas
     */
    async compararMoedas(req, res, next) {
        try {
            const { moeda1, moeda2 } = req.params;
            const { dias = 30 } = req.query;

            const [historico1, historico2] = await Promise.all([
                cotacaoService.buscarHistorico(moeda1, parseInt(dias)),
                cotacaoService.buscarHistorico(moeda2, parseInt(dias))
            ]);

            if (historico1.length === 0 || historico2.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Dados insuficientes',
                    message: 'Uma ou ambas as moedas não possuem dados suficientes'
                });
            }

            // Alinhar dados por data
            const comparacao = [];
            const maxLength = Math.min(historico1.length, historico2.length);

            for (let i = 0; i < maxLength; i++) {
                comparacao.push({
                    timestamp: historico1[i].timestamp,
                    [moeda1]: historico1[i].bid,
                    [moeda2]: historico2[i].bid,
                    diferenca: Math.abs(historico1[i].bid - historico2[i].bid)
                });
            }

            res.json({
                success: true,
                data: {
                    moeda1,
                    moeda2,
                    comparacao,
                    correlacao: this.calcularCorrelacao(
                        historico1.slice(0, maxLength).map(h => h.bid),
                        historico2.slice(0, maxLength).map(h => h.bid)
                    )
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao comparar moedas:', error);
            next(error);
        }
    }

    /**
     * Calcula correlação entre duas séries
     */
    calcularCorrelacao(serie1, serie2) {
        if (serie1.length !== serie2.length || serie1.length === 0) return 0;

        const n = serie1.length;
        const media1 = serie1.reduce((a, b) => a + b, 0) / n;
        const media2 = serie2.reduce((a, b) => a + b, 0) / n;

        let numerador = 0;
        let denom1 = 0;
        let denom2 = 0;

        for (let i = 0; i < n; i++) {
            const diff1 = serie1[i] - media1;
            const diff2 = serie2[i] - media2;
            numerador += diff1 * diff2;
            denom1 += diff1 * diff1;
            denom2 += diff2 * diff2;
        }

        const denominador = Math.sqrt(denom1 * denom2);
        return denominador === 0 ? 0 : (numerador / denominador).toFixed(4);
    }
}

module.exports = new CotacaoController();