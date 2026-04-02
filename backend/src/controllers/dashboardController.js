const { prisma } = require('../config/database');
const cotacaoService = require('../services/cotacaoService');
const logger = require('../config/logger');

class DashboardController {
    /**
     * Resumo geral do dashboard
     */
    async resumo(req, res, next) {
        try {
            const [totalCotacoes, moedas, ultimasColetas, estatisticasGerais] = await Promise.all([
                prisma.cotacao.count(),
                cotacaoService.buscarMoedasDisponiveis(),
                prisma.coletaLog.findMany({
                    take: 5,
                    orderBy: { startedAt: 'desc' }
                }),
                this.calcularEstatisticasGerais()
            ]);

            // Buscar cotações atuais para cada moeda
            const cotaçõesAtuais = {};
            for (const moeda of moedas.slice(0, 5)) { // Limita a 5 moedas para performance
                try {
                    const cotacao = await cotacaoService.buscarCotacaoAtual(moeda);
                    if (cotacao) {
                        cotaçõesAtuais[moeda] = {
                            bid: cotacao.bid,
                            ask: cotacao.ask,
                            pctChange: cotacao.pctChange,
                            timestamp: cotacao.timestamp
                        };
                    }
                } catch (error) {
                    logger.error(`Erro ao buscar cotação atual para ${moeda}:`, error);
                }
            }

            res.json({
                success: true,
                data: {
                    total_cotacoes: totalCotacoes,
                    total_moedas: moedas.length,
                    moedas_disponiveis: moedas,
                    ultimas_coletas: ultimasColetas,
                    estatisticas_gerais: estatisticasGerais,
                    cotações_atuais: cotaçõesAtuais
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao gerar resumo do dashboard:', error);
            next(error);
        }
    }

    /**
     * Dados para gráfico de evolução
     */
    async evolucao(req, res, next) {
        try {
            const { moeda = 'USD-BRL', dias = 7 } = req.query;

            const historico = await cotacaoService.buscarHistorico(moeda, parseInt(dias));

            // Preparar dados para gráfico
            const dadosGrafico = historico.map(cotacao => ({
                timestamp: cotacao.timestamp,
                bid: cotacao.bid,
                ask: cotacao.ask,
                high: cotacao.high,
                low: cotacao.low
            }));

            // Calcular variação percentual
            if (dadosGrafico.length > 0) {
                const primeiro = dadosGrafico[0].bid;
                const ultimo = dadosGrafico[dadosGrafico.length - 1].bid;
                const variacao = ((ultimo - primeiro) / primeiro * 100).toFixed(2);

                res.json({
                    success: true,
                    data: {
                        moeda,
                        periodo: `${dias} dias`,
                        dados: dadosGrafico,
                        variacao_percentual: variacao,
                        inicio_periodo: dadosGrafico[0].timestamp,
                        fim_periodo: dadosGrafico[dadosGrafico.length - 1].timestamp
                    },
                    timestamp: new Date().toISOString()
                });
            } else {
                res.json({
                    success: true,
                    data: {
                        moeda,
                        periodo: `${dias} dias`,
                        dados: [],
                        mensagem: 'Nenhum dado disponível para o período'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error('Erro ao gerar dados de evolução:', error);
            next(error);
        }
    }

    /**
     * Calcula estatísticas gerais
     */
    async calcularEstatisticasGerais() {
        try {
            const hoje = new Date();
            const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

            const [totalHoje, mediaDia, ultimaAtualizacao] = await Promise.all([
                prisma.cotacao.count({
                    where: {
                        timestamp: { gte: inicioDia }
                    }
                }),
                prisma.cotacao.groupBy({
                    by: ['moeda'],
                    _avg: {
                        bid: true
                    },
                    where: {
                        timestamp: { gte: inicioDia }
                    }
                }),
                prisma.coletaLog.findFirst({
                    orderBy: { finishedAt: 'desc' }
                })
            ]);

            return {
                total_cotacoes_hoje: totalHoje,
                media_cotacoes_por_moeda: mediaDia.map(m => ({
                    moeda: m.moeda,
                    media: m._avg.bid?.toFixed(4) || 0
                })),
                ultima_atualizacao: ultimaAtualizacao?.finishedAt || null,
                status_sistema: 'operacional'
            };
        } catch (error) {
            logger.error('Erro ao calcular estatísticas gerais:', error);
            return {};
        }
    }

    /**
     * Top variações do dia
     */
    async topVariacoes(req, res, next) {
        try {
            const moedas = await cotacaoService.buscarMoedasDisponiveis();
            const variacoes = [];

            for (const moeda of moedas) {
                try {
                    const stats = await cotacaoService.calcularEstatisticas(moeda, 1);
                    if (stats) {
                        variacoes.push({
                            moeda,
                            variacao: parseFloat(stats.variacao_periodo),
                            cotacao_atual: parseFloat(stats.cotacao_atual),
                            media: parseFloat(stats.media_bid)
                        });
                    }
                } catch (error) {
                    logger.error(`Erro ao calcular variação para ${moeda}:`, error);
                }
            }

            // Ordenar por variação
            variacoes.sort((a, b) => b.variacao - a.variacao);

            res.json({
                success: true,
                data: {
                    maiores_altas: variacoes.slice(0, 5),
                    maiores_baixas: variacoes.slice(-5).reverse()
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar top variações:', error);
            next(error);
        }
    }
}

module.exports = new DashboardController();