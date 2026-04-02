const { prisma } = require('../config/database');
const { cache } = require('../config/redis');
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

            // Invalidar cache após salvar nova cotação
            await this.limparCacheMoeda(dados.moeda);

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
     * Busca cotação atual para uma moeda específica com cache
     */
    async buscarCotacaoAtual(moeda) {
        const cacheKey = `cotacao:atual:${moeda}`;

        try {
            // Tentar obter do cache Redis
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug(`📦 Cache hit para ${moeda}`);
                return cached;
            }

            logger.debug(`💾 Cache miss para ${moeda}, buscando do banco/API`);

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
                logger.info(`🌐 Buscando cotação da API para ${moeda}`);
                const dadosApi = await apiService.getCotacoesAtuais(moeda);

                if (dadosApi && dadosApi[moeda]) {
                    const dados = dadosApi[moeda];
                    cotacao = {
                        moeda: moeda,
                        bid: parseFloat(dados.bid),
                        ask: parseFloat(dados.ask),
                        high: parseFloat(dados.high),
                        low: parseFloat(dados.low),
                        varBid: parseFloat(dados.varBid),
                        pctChange: parseFloat(dados.pctChange),
                        timestamp: new Date(dados.timestamp * 1000)
                    };

                    // Salvar no banco
                    await prisma.cotacao.upsert({
                        where: {
                            moeda_timestamp: {
                                moeda: moeda,
                                timestamp: cotacao.timestamp
                            }
                        },
                        update: cotacao,
                        create: cotacao
                    });
                }
            }

            // Salvar no cache por 60 segundos
            if (cotacao) {
                await cache.set(cacheKey, cotacao, 60);
            }

            return cotacao;
        } catch (error) {
            logger.error(`Erro ao buscar cotação atual: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca histórico de uma moeda com cache
     */
    async buscarHistorico(moeda, dias = 30) {
        const cacheKey = `cotacao:historico:${moeda}:${dias}`;

        try {
            // Tentar obter do cache Redis
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug(`📦 Cache hit para histórico ${moeda} (${dias} dias)`);
                return cached;
            }

            logger.debug(`💾 Cache miss para histórico ${moeda}, buscando do banco/API`);

            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - dias);

            let cotacoes = await prisma.cotacao.findMany({
                where: {
                    moeda: moeda,
                    timestamp: {
                        gte: dataInicio
                    }
                },
                orderBy: { timestamp: 'asc' }
            });

            // Se não tiver dados suficientes (menos de 80%), busca da API
            if (cotacoes.length < dias * 0.8) {
                logger.info(`🌐 Buscando histórico da API para ${moeda} (${dias} dias)`);
                const dadosApi = await apiService.getHistoricoCotacoes(moeda, dias);

                if (dadosApi && dadosApi.length > 0) {
                    for (const dado of dadosApi) {
                        const cotacao = {
                            moeda: moeda,
                            bid: parseFloat(dado.bid),
                            ask: parseFloat(dado.ask),
                            high: parseFloat(dado.high),
                            low: parseFloat(dado.low),
                            varBid: parseFloat(dado.varBid),
                            pctChange: parseFloat(dado.pctChange),
                            timestamp: new Date(dado.timestamp * 1000)
                        };

                        await prisma.cotacao.upsert({
                            where: {
                                moeda_timestamp: {
                                    moeda: moeda,
                                    timestamp: cotacao.timestamp
                                }
                            },
                            update: cotacao,
                            create: cotacao
                        });
                    }

                    // Buscar novamente após salvar
                    cotacoes = await prisma.cotacao.findMany({
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

            // Salvar no cache por 5 minutos (300 segundos)
            if (cotacoes.length > 0) {
                await cache.set(cacheKey, cotacoes, 300);
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
        const cacheKey = `cotacao:estatisticas:${moeda}:${dias}`;

        try {
            // Tentar obter do cache Redis
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug(`📦 Cache hit para estatísticas ${moeda}`);
                return cached;
            }

            logger.debug(`💾 Cache miss para estatísticas ${moeda}`);

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

            // Salvar no cache por 10 minutos (600 segundos)
            await cache.set(cacheKey, stats, 600);

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
        if (valores.length === 0) return 0;
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const quadrados = valores.map(v => Math.pow(v - media, 2));
        const variancia = quadrados.reduce((a, b) => a + b, 0) / valores.length;
        return Math.sqrt(variancia);
    }

    /**
     * Busca moedas disponíveis
     */
    async buscarMoedasDisponiveis() {
        const cacheKey = 'cotacao:moedas_disponiveis';

        try {
            // Tentar obter do cache Redis
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug('📦 Cache hit para moedas disponíveis');
                return cached;
            }

            logger.debug('💾 Cache miss para moedas disponíveis');

            const moedas = await prisma.cotacao.findMany({
                select: { moeda: true },
                distinct: ['moeda'],
                orderBy: { moeda: 'asc' }
            });

            const resultado = moedas.map(m => m.moeda);

            // Salvar no cache por 1 hora (3600 segundos)
            if (resultado.length > 0) {
                await cache.set(cacheKey, resultado, 3600);
            }

            return resultado;
        } catch (error) {
            logger.error(`Erro ao buscar moedas: ${error.message}`);
            return [];
        }
    }

    /**
     * Limpar cache de uma moeda específica
     */
    async limparCacheMoeda(moeda) {
        try {
            const patterns = [
                `cotacao:atual:${moeda}`,
                `cotacao:historico:${moeda}:*`,
                `cotacao:estatisticas:${moeda}:*`
            ];

            for (const pattern of patterns) {
                await cache.delPattern(pattern);
            }

            // Também limpar cache de moedas disponíveis
            await cache.del('cotacao:moedas_disponiveis');

            logger.info(`🗑️ Cache limpo para moeda: ${moeda}`);
        } catch (error) {
            logger.error(`Erro ao limpar cache da moeda ${moeda}: ${error.message}`);
        }
    }

    /**
     * Limpar todo o cache de cotações
     */
    async limparTodoCache() {
        try {
            await cache.limparCacheCotacoes();
            await cache.del('cotacao:moedas_disponiveis');
            logger.info('🗑️ Todo o cache de cotações foi limpo');
        } catch (error) {
            logger.error(`Erro ao limpar todo cache: ${error.message}`);
        }
    }

    /**
     * Compara duas moedas
     */
    async compararMoedas(moeda1, moeda2, dias = 30) {
        const cacheKey = `cotacao:comparacao:${moeda1}:${moeda2}:${dias}`;

        try {
            // Tentar obter do cache Redis
            const cached = await cache.get(cacheKey);
            if (cached) {
                logger.debug(`📦 Cache hit para comparação ${moeda1} vs ${moeda2}`);
                return cached;
            }

            logger.debug(`💾 Cache miss para comparação ${moeda1} vs ${moeda2}`);

            const [historico1, historico2] = await Promise.all([
                this.buscarHistorico(moeda1, dias),
                this.buscarHistorico(moeda2, dias)
            ]);

            if (historico1.length === 0 || historico2.length === 0) {
                throw new Error('Uma ou ambas as moedas não possuem dados suficientes');
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

            const resultado = {
                moeda1,
                moeda2,
                comparacao,
                correlacao: this.calcularCorrelacao(
                    historico1.slice(0, maxLength).map(h => h.bid),
                    historico2.slice(0, maxLength).map(h => h.bid)
                )
            };

            // Salvar no cache por 10 minutos
            await cache.set(cacheKey, resultado, 600);

            return resultado;
        } catch (error) {
            logger.error(`Erro ao comparar moedas: ${error.message}`);
            throw error;
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

module.exports = new CotacaoService();