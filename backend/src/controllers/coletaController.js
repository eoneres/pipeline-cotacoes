const { prisma } = require('../config/database');
const coletaJob = require('../jobs/coletaJob');
const logger = require('../config/logger');

class ColetaController {
    /**
     * Dispara coleta manual
     */
    async dispararColetaManual(req, res, next) {
        try {
            const { moedas } = req.body;

            // Se especificou moedas, atualiza temporariamente
            if (moedas && moedas.length > 0) {
                const moedasOriginal = process.env.MOEDAS;
                process.env.MOEDAS = moedas.join(',');

                // Executa coleta
                await coletaJob.executarColeta();

                // Restaura moedas originais
                process.env.MOEDAS = moedasOriginal;
            } else {
                await coletaJob.executarColeta();
            }

            res.json({
                success: true,
                message: 'Coleta manual disparada com sucesso',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao disparar coleta manual:', error);
            next(error);
        }
    }

    /**
     * Lista logs de coleta
     */
    async listarLogs(req, res, next) {
        try {
            const { limit = 50, offset = 0, status } = req.query;

            const where = {};
            if (status) {
                where.status = status;
            }

            const [logs, total] = await Promise.all([
                prisma.coletaLog.findMany({
                    where,
                    orderBy: { startedAt: 'desc' },
                    take: parseInt(limit),
                    skip: parseInt(offset)
                }),
                prisma.coletaLog.count({ where })
            ]);

            res.json({
                success: true,
                data: logs,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    pages: Math.ceil(total / parseInt(limit))
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao listar logs:', error);
            next(error);
        }
    }

    /**
     * Busca status da última coleta
     */
    async buscarUltimaColeta(req, res, next) {
        try {
            const ultimaColeta = await prisma.coletaLog.findFirst({
                orderBy: { startedAt: 'desc' }
            });

            res.json({
                success: true,
                data: ultimaColeta,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar última coleta:', error);
            next(error);
        }
    }

    /**
     * Busca estatísticas das coletas
     */
    async buscarEstatisticasColeta(req, res, next) {
        try {
            const ultimas24h = new Date();
            ultimas24h.setHours(ultimas24h.getHours() - 24);

            const [totalColetas, coletasSucesso, coletasErro, mediaRegistros] = await Promise.all([
                prisma.coletaLog.count(),
                prisma.coletaLog.count({ where: { status: 'success' } }),
                prisma.coletaLog.count({ where: { status: 'error' } }),
                prisma.coletaLog.aggregate({
                    where: {
                        status: 'success',
                        startedAt: { gte: ultimas24h }
                    },
                    _avg: { registros: true }
                })
            ]);

            res.json({
                success: true,
                data: {
                    total_coletas: totalColetas,
                    sucesso: coletasSucesso,
                    erro: coletasErro,
                    taxa_sucesso: totalColetas > 0 ? ((coletasSucesso / totalColetas) * 100).toFixed(2) : 0,
                    media_registros_24h: mediaRegistros._avg.registros || 0,
                    ultimas_24h: {
                        sucesso: await prisma.coletaLog.count({
                            where: {
                                status: 'success',
                                startedAt: { gte: ultimas24h }
                            }
                        }),
                        erro: await prisma.coletaLog.count({
                            where: {
                                status: 'error',
                                startedAt: { gte: ultimas24h }
                            }
                        })
                    }
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao buscar estatísticas de coleta:', error);
            next(error);
        }
    }
}

module.exports = new ColetaController();