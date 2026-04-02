const { prisma } = require('../config/database');
const logger = require('../config/logger');

class ForecastService {
    constructor() {
        logger.info('🤖 Serviço de Previsões inicializado');
    }

    /**
     * Calcula regressão linear para previsão
     * @param {Array} dados - Array de valores numéricos
     * @returns {Object} Coeficientes da regressão
     */
    calcularRegressaoLinear(dados) {
        const n = dados.length;
        if (n < 2) return null;

        // Calcular médias
        const indices = Array.from({ length: n }, (_, i) => i);
        const mediaX = indices.reduce((a, b) => a + b, 0) / n;
        const mediaY = dados.reduce((a, b) => a + b, 0) / n;

        // Calcular coeficientes
        let numerador = 0;
        let denominador = 0;

        for (let i = 0; i < n; i++) {
            numerador += (i - mediaX) * (dados[i] - mediaY);
            denominador += Math.pow(i - mediaX, 2);
        }

        const inclinacao = numerador / denominador;
        const interceptacao = mediaY - inclinacao * mediaX;

        return { inclinacao, interceptacao };
    }

    /**
     * Calcula o coeficiente de correlação (R²)
     */
    calcularR2(dados, previsoes) {
        const mediaY = dados.reduce((a, b) => a + b, 0) / dados.length;
        const ssRes = dados.reduce((sum, y, i) => sum + Math.pow(y - previsoes[i], 2), 0);
        const ssTot = dados.reduce((sum, y) => sum + Math.pow(y - mediaY, 2), 0);
        return 1 - (ssRes / ssTot);
    }

    /**
     * Calcula o erro médio absoluto (MAE)
     */
    calcularMAE(dados, previsoes) {
        return dados.reduce((sum, y, i) => sum + Math.abs(y - previsoes[i]), 0) / dados.length;
    }

    /**
     * Prepara dados históricos para treinamento
     */
    async prepararDadosTreinamento(moeda, dias = 30) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - dias);

        const cotacoes = await prisma.cotacao.findMany({
            where: {
                moeda: moeda,
                timestamp: { gte: dataInicio }
            },
            orderBy: { timestamp: 'asc' }
        });

        if (cotacoes.length < 5) {
            throw new Error(`Dados insuficientes para previsão da moeda ${moeda}. Necessário pelo menos 5 registros.`);
        }

        return cotacoes;
    }

    /**
     * Gera previsão simples (próximos N dias)
     */
    async previsaoSimples(moeda, diasPrevisao = 7) {
        try {
            const cotacoes = await this.prepararDadosTreinamento(moeda, 30);
            const bids = cotacoes.map(c => c.bid);
            const timestamps = cotacoes.map(c => c.timestamp);

            // Calcular regressão linear
            const regressao = this.calcularRegressaoLinear(bids);
            if (!regressao) {
                throw new Error('Não foi possível calcular a regressão linear');
            }

            // Gerar previsões
            const ultimoIndice = bids.length - 1;
            const previsoes = [];
            const datasPrevisao = [];

            for (let i = 1; i <= diasPrevisao; i++) {
                const indiceFuturo = ultimoIndice + i;
                const valorPrevisto = regressao.inclinacao * indiceFuturo + regressao.interceptacao;
                const dataPrevista = new Date(timestamps[timestamps.length - 1]);
                dataPrevista.setDate(dataPrevista.getDate() + i);

                previsoes.push({
                    dia: i,
                    data: dataPrevista,
                    valor: Math.max(0, valorPrevisto), // Não permitir valores negativos
                    intervaloSuperior: valorPrevisto * 1.02, // Intervalo de confiança +2%
                    intervaloInferior: Math.max(0, valorPrevisto * 0.98) // Intervalo de confiança -2%
                });

                datasPrevisao.push(dataPrevista);
            }

            // Calcular métricas de acurácia
            const previsoesPassadas = bids.map((_, i) =>
                regressao.inclinacao * i + regressao.interceptacao
            );
            const r2 = this.calcularR2(bids, previsoesPassadas);
            const mae = this.calcularMAE(bids, previsoesPassadas);

            // Determinar tendência
            let tendencia = 'estável';
            let corTendencia = '#6b7280';
            let iconeTendencia = '➡️';

            if (regressao.inclinacao > 0.01) {
                tendencia = 'alta';
                corTendencia = '#10b981';
                iconeTendencia = '📈';
            } else if (regressao.inclinacao < -0.01) {
                tendencia = 'baixa';
                corTendencia = '#ef4444';
                iconeTendencia = '📉';
            }

            return {
                success: true,
                moeda,
                dados_historicos: {
                    total_registros: bids.length,
                    periodo_inicio: timestamps[0],
                    periodo_fim: timestamps[timestamps.length - 1],
                    valor_atual: bids[bids.length - 1],
                    media_periodo: bids.reduce((a, b) => a + b, 0) / bids.length
                },
                modelo: {
                    tipo: 'Regressão Linear',
                    inclinacao: regressao.inclinacao,
                    interceptacao: regressao.interceptacao,
                    r_quadrado: r2,
                    erro_medio_absoluto: mae,
                    acuracia: Math.max(0, Math.min(100, (1 - (mae / bids[bids.length - 1])) * 100))
                },
                previsoes,
                analise: {
                    tendencia,
                    corTendencia,
                    iconeTendencia,
                    mensagem: this.gerarMensagemAnalise(tendencia, regressao.inclinacao, r2),
                    recomendacao: this.gerarRecomendacao(tendencia, r2)
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error(`Erro na previsão simples: ${error.message}`);
            throw error;
        }
    }

    /**
     * Previsão usando média móvel
     */
    async previsaoMediaMovel(moeda, janela = 7, diasPrevisao = 7) {
        try {
            const cotacoes = await this.prepararDadosTreinamento(moeda, 30);
            const bids = cotacoes.map(c => c.bid);
            const timestamps = cotacoes.map(c => c.timestamp);

            // Calcular média móvel dos últimos N dias
            const mediaMovel = bids.slice(-janela).reduce((a, b) => a + b, 0) / janela;

            // Calcular tendência recente
            const tendenciaRecente = bids[bids.length - 1] - bids[bids.length - Math.min(5, bids.length)];
            const variacaoDiariaMedia = tendenciaRecente / Math.min(5, bids.length);

            // Gerar previsões
            const previsoes = [];
            let ultimoValor = bids[bids.length - 1];

            for (let i = 1; i <= diasPrevisao; i++) {
                const valorPrevisto = mediaMovel + (variacaoDiariaMedia * i);
                const dataPrevista = new Date(timestamps[timestamps.length - 1]);
                dataPrevista.setDate(dataPrevista.getDate() + i);

                previsoes.push({
                    dia: i,
                    data: dataPrevista,
                    valor: Math.max(0, valorPrevisto),
                    intervaloSuperior: valorPrevisto * 1.03,
                    intervaloInferior: Math.max(0, valorPrevisto * 0.97)
                });

                ultimoValor = valorPrevisto;
            }

            return {
                success: true,
                moeda,
                metodo: 'Média Móvel',
                janela: janela,
                dados_historicos: {
                    total_registros: bids.length,
                    valor_atual: bids[bids.length - 1],
                    media_movel: mediaMovel
                },
                previsoes,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error(`Erro na previsão por média móvel: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gera mensagem de análise baseada nos dados
     */
    gerarMensagemAnalise(tendencia, inclinacao, r2) {
        const confianca = r2 > 0.7 ? 'alta' : (r2 > 0.4 ? 'média' : 'baixa');

        if (tendencia === 'alta') {
            return `📈 Tendência de ${tendencia} identificada com confiança ${confianca}. Inclinação de ${inclinacao.toFixed(4)} por período.`;
        } else if (tendencia === 'baixa') {
            return `📉 Tendência de ${tendencia} identificada com confiança ${confianca}. Inclinação de ${inclinacao.toFixed(4)} por período.`;
        } else {
            return `➡️ Mercado estável com confiança ${confianca}. Pouca variação esperada nos próximos dias.`;
        }
    }

    /**
     * Gera recomendação baseada na análise
     */
    gerarRecomendacao(tendencia, r2) {
        if (r2 < 0.3) {
            return '⚠️ Baixa confiabilidade na previsão. Recomenda-se cautela nas decisões.';
        }

        switch (tendencia) {
            case 'alta':
                return '💚 Cenário otimista. Considere posição comprada (long) com stop loss adequado.';
            case 'baixa':
                return '❤️ Cenário pessimista. Considere posição vendida (short) ou aguardar reversão.';
            default:
                return '💛 Mercado lateral. Aguardar definição de tendência para entrada.';
        }
    }

    /**
     * Compara previsões com diferentes métodos
     */
    async compararPrevisoes(moeda, diasPrevisao = 7) {
        try {
            const [previsaoLinear, previsaoMM] = await Promise.all([
                this.previsaoSimples(moeda, diasPrevisao),
                this.previsaoMediaMovel(moeda, 7, diasPrevisao)
            ]);

            return {
                success: true,
                moeda,
                metodos: {
                    regressao_linear: previsaoLinear,
                    media_movel: previsaoMM
                },
                comparacao: {
                    diferenca_media: Math.abs(
                        previsaoLinear.previsoes.reduce((a, b, i) => a + (b.valor - previsaoMM.previsoes[i].valor), 0) / diasPrevisao
                    ),
                    metodo_recomendado: previsaoLinear.modelo.r_quadrado > 0.5 ? 'regressao_linear' : 'media_movel'
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error(`Erro na comparação de previsões: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ForecastService();