const { prisma } = require('../config/database');
const logger = require('../config/logger');
const apiService = require('./apiService');

class CotacaoService {
    /**
     * Salva uma nova cotação no banco
     */
    async salvarCotacao(dados) {
        try {
            const cotacao = await prisma.cotacao.upsert({
                where: {
                    moeda_timestamp: {
                        moeda: dados.moeda,
                        timestamp: dados.timestamp
                    }
                },
                update: dados,
                create: dados
            });

            return cotacao;
        } catch (error) {
            logger.error(`Erro ao salvar cotação: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca cotações com filtros
     */
    async buscarCotações(filtros = {}) {
        const { moeda, startDate, endDate, limit = 100, offset = 0 } = filtros;

        const where = {};

        if (moeda) {
            where.moeda = moeda;
        }

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = new Date(startDate);
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate);
            }
        }

        try {
            const [cotacoes, total] = await Promise.all([
                prisma.cotacao.findMany({
                    where,
                    orderBy: { timestamp: 'desc' },
                    take: parseInt(limit),
                    skip: parseInt(offset)
                }),
                prisma.cotacao.count({ where })
            ]);

            return {
                data: cotacoes,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            logger.error(`Erro ao buscar cotações: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca cotação atual para uma moeda específica
     */
    async buscarCotacaoAtual(moeda) {
        try {
            // Primeiro tenta buscar do banco (última hora)
            const umaHoraAtras = new Date();
            umaHoraAtras.setHours(umaHoraAtras.getHours() - 1);

            let cotacao = await prisma.cotacao.findFirst({
                where: {
                    moeda: moeda,
                    timestamp: {
                        gte: umaHoraAtras
                    }
                },
                orderBy: { timestamp: 'desc' }
            });

            // Se não tiver dados recentes, busca da API
            if (!cotacao) {
                logger.info(`Buscando cotação atual da API para ${moeda}`);
                const dadosApi = await apiService.getCotacoesAtuais(moeda);

                if (dadosApi && dadosApi[moeda]) {
                    const dados = dadosApi[moeda];
                    cotacao = await this.salvarCotacao({
                        moeda: moeda,
                        bid: parseFloat(dados.bid),
                        ask: parseFloat(dados.ask),
                        high: parseFloat(dados.high),
                        low: parseFloat(dados.low),
                        varBid: parseFloat(dados.varBid),
                        pctChange: parseFloat(dados.pctChange),
                        timestamp: new Date(dados.timestamp * 1000)
                    });
                }
            }

            return cotacao;
        } catch (error) {
            logger.error(`Erro ao buscar cotação atual: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca histórico de uma moeda
     */
    async buscarHistorico(moeda, dias = 30) {
        try {
            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - dias);

            const cotacoes = await prisma.cotacao.findMany({
                where: {
                    moeda: moeda,
                    timestamp: {
                        gte: dataInicio
                    }
                },
                orderBy: { timestamp: 'asc' }
            });

            // Se não tiver dados suficientes, busca da API
            if (cotacoes.length < dias * 0.8) { // Se tiver menos de 80% dos dados
                logger.info(`Buscando histórico da API para ${moeda} (${dias} dias)`);
                const dadosApi = await apiService.getHistoricoCotacoes(moeda, dias);

                if (dadosApi && dadosApi.length > 0) {
                    for (const dado of dadosApi) {
                        await this.salvarCotacao({
                            moeda: moeda,
                            bid: parseFloat(dado.bid),
                            ask: parseFloat(dado.ask),
                            high: parseFloat(dado.high),
                            low: parseFloat(dado.low),
                            varBid: parseFloat(dado.varBid),
                            pctChange: parseFloat(dado.pctChange),
                            timestamp: new Date(dado.timestamp * 1000)
                        });
                    }

                    // Busca novamente após salvar
                    return await prisma.cotacao.findMany({
                        where: {
                            moeda: moeda,
                            timestamp: {
                                gte: dataInicio
                            }
                        },
                        orderBy: { timestamp: 'asc' }
                    });
                }
            }

            return cotacoes;
        } catch (error) {
            logger.error(`Erro ao buscar histórico: ${error.message}`);
            throw error;
        }
    }

    /**
     * Calcula estatísticas para uma moeda
     */
    async calcularEstatisticas(moeda, dias = 30) {
        try {
            const historico = await this.buscarHistorico(moeda, dias);

            if (historico.length === 0) {
                return null;
            }

            const bids = historico.map(c => c.bid);
            const asks = historico.map(c => c.ask);
            const pctChanges = historico.map(c => c.pctChange);

            const stats = {
                moeda,
                periodo: `${dias} dias`,
                total_registros: historico.length,
                data_inicio: historico[0].timestamp,
                data_fim: historico[historico.length - 1].timestamp,
                cotacao_atual: historico[historico.length - 1].bid,
                cotacao_anterior: historico[0].bid,
                variacao_periodo: ((historico[historico.length - 1].bid - historico[0].bid) / historico[0].bid * 100).toFixed(2),
                media_bid: (bids.reduce((a, b) => a + b, 0) / bids.length).toFixed(4),
                max_bid: Math.max(...bids).toFixed(4),
                min_bid: Math.min(...bids).toFixed(4),
                desvio_padrao_bid: this.calcularDesvioPadrao(bids).toFixed(4),
                media_pct_change: (pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length).toFixed(2),
                max_pct_change: Math.max(...pctChanges).toFixed(2),
                min_pct_change: Math.min(...pctChanges).toFixed(2)
            };

            return stats;
        } catch (error) {
            logger.error(`Erro ao calcular estatísticas: ${error.message}`);
            throw error;
        }
    }

    /**
     * Calcula desvio padrão
     */
    calcularDesvioPadrao(valores) {
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const quadrados = valores.map(v => Math.pow(v - media, 2));
        const variancia = quadrados.reduce((a, b) => a + b, 0) / valores.length;
        return Math.sqrt(variancia);
    }

    /**
     * Busca moedas disponíveis
     */
    async buscarMoedasDisponiveis() {
        try {
            const moedas = await prisma.cotacao.findMany({
                select: { moeda: true },
                distinct: ['moeda'],
                orderBy: { moeda: 'asc' }
            });

            return moedas.map(m => m.moeda);
        } catch (error) {
            logger.error(`Erro ao buscar moedas: ${error.message}`);
            return [];
        }
    }
}

module.exports = new CotacaoService();