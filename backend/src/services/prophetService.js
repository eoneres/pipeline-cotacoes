const { PythonShell } = require('python-shell');
const path = require('path');
const { cache } = require('../config/redis');
const logger = require('../config/logger');
const cotacaoService = require('./cotacaoService');

class ProphetService {
    constructor() {
        this.scriptPath = path.join(__dirname, '../ml');
    }

    /**
     * Executa previsão usando Prophet
     */
    async preverComProphet(moeda, diasPrevisao = 30) {
        const cacheKey = `prophet:previsao:${moeda}:${diasPrevisao}`;

        try {
            // Verificar cache
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug(`📦 Cache hit para Prophet ${moeda}`);
                return cached;
            }

            logger.info(`🤖 Executando Prophet para ${moeda} (${diasPrevisao} dias)`);

            // Buscar dados históricos (mínimo 60 dias para Prophet)
            const historico = await cotacaoService.buscarHistorico(moeda, 90);

            if (historico.length < 30) {
                throw new Error(`Dados insuficientes para Prophet. Necessário pelo menos 30 dias, tem ${historico.length}`);
            }

            // Preparar dados para o Python
            const dadosProphet = historico.map(c => ({
                timestamp: c.timestamp,
                bid: c.bid
            }));

            const inputData = {
                moeda,
                dados: dadosProphet,
                dias_previsao: diasPrevisao
            };

            // Executar script Python
            const options = {
                mode: 'text',
                pythonOptions: ['-u'],
                scriptPath: this.scriptPath,
                args: [JSON.stringify(inputData)]
            };

            const results = await PythonShell.run('prophet_forecast.py', options);
            const resultado = JSON.parse(results[0]);

            if (!resultado.success) {
                throw new Error(resultado.error);
            }

            // Salvar cache por 1 hora (previsões não mudam rápido)
            await cache.set(cacheKey, resultado, 3600);

            return resultado;

        } catch (error) {
            logger.error(`Erro no Prophet: ${error.message}`);
            throw error;
        }
    }

    /**
     * Compara Prophet com Regressão Linear
     */
    async compararModelos(moeda, diasPrevisao = 30) {
        try {
            const forecastService = require('./forecastService');

            const [prophetResult, regressaoResult] = await Promise.all([
                this.preverComProphet(moeda, diasPrevisao),
                forecastService.previsaoSimples(moeda, diasPrevisao)
            ]);

            return {
                moeda,
                dias_previsao: diasPrevisao,
                comparacao: {
                    prophet: {
                        nome: 'Prophet (Facebook)',
                        acuracia: prophetResult.metricas?.mape ? (100 - prophetResult.metricas.mape).toFixed(1) : 'N/A',
                        mae: prophetResult.metricas?.mae?.toFixed(4) || 'N/A',
                        tendencia: prophetResult.analise?.tendencia || 'N/A',
                        confianca: prophetResult.analise?.confianca_modelo || 'N/A'
                    },
                    regressao_linear: {
                        nome: 'Regressão Linear',
                        acuracia: regressaoResult.modelo?.acuracia?.toFixed(1) || 'N/A',
                        r_quadrado: regressaoResult.modelo?.r_quadrado ? (regressaoResult.modelo.r_quadrado * 100).toFixed(1) : 'N/A',
                        tendencia: regressaoResult.analise?.tendencia || 'N/A',
                        confianca: regressaoResult.analise?.tendencia === 'alta' ? 'Alta' : 'Média'
                    }
                },
                recomendacao: this.gerarRecomendacaoComparacao(prophetResult, regressaoResult),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error(`Erro ao comparar modelos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gera recomendação baseada na comparação
     */
    gerarRecomendacaoComparacao(prophet, regressao) {
        const prophetAcurasia = prophet.metricas?.mape ? 100 - prophet.metricas.mape : 0;
        const regressaoAcurasia = regressao.modelo?.acuracia || 0;

        if (prophetAcurasia > regressaoAcurasia + 10) {
            return '📊 Prophet apresenta maior acurácia. Recomendado para decisões de médio/longo prazo.';
        } else if (regressaoAcurasia > prophetAcurasia + 10) {
            return '📈 Regressão Linear apresenta resultados mais estáveis. Bom para tendências de curto prazo.';
        } else {
            return '⚖️ Modelos com performance similar. Considere usar ambos para validação cruzada.';
        }
    }

    /**
     * Obtém componentes da previsão (tendência, sazonalidade)
     */
    async obterComponentes(moeda) {
        const previsao = await this.preverComProphet(moeda, 30);

        return {
            moeda,
            tendencia: {
                atual: previsao.previsoes[previsao.previsoes.length - 1]?.tendencia || 0,
                inclinacao: previsao.analise?.inclinacao_tendencia || 0,
                direcao: previsao.analise?.tendencia || 'estavel'
            },
            sazonalidade: {
                tipo: previsao.analise?.sazonalidade_dominante || 'semanal',
                forca: previsao.analise?.impacto_feriados_proximo || 0
            },
            proximos_feriados: previsao.componentes?.feriados?.filter(f => Math.abs(f.holidays) > 0.001) || []
        };
    }
}

module.exports = new ProphetService();