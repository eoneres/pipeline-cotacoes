const cron = require('node-cron');
const apiService = require('../services/apiService');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

class ColetaJob {
    constructor() {
        this.isRunning = false;
        this.schedule = process.env.COLETA_CRON_SCHEDULE || '*/5 * * * *';
        this.moedas = (process.env.MOEDAS || 'USD-BRL,EUR-BRL').split(',');
    }

    start() {
        if (this.schedule && this.schedule !== '') {
            logger.info(`🔄 Iniciando job de coleta com schedule: ${this.schedule}`);

            this.task = cron.schedule(this.schedule, async () => {
                await this.executarColeta();
            });

            logger.info('✅ Job de coleta agendado com sucesso');

            // Executar primeira coleta imediatamente
            setTimeout(() => this.executarColeta(), 2000);
        } else {
            logger.warn('⚠️ Schedule de coleta vazio. Job não iniciado.');
        }
    }

    stop() {
        if (this.task) {
            this.task.stop();
            logger.info('⏹️ Job de coleta parado');
        }
    }

    async executarColeta() {
        if (this.isRunning) {
            logger.warn('⚠️ Coleta já está em execução. Pulando...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        logger.info(`🚀 Iniciando coleta de cotações para ${this.moedas.join(', ')}`);

        const logId = await this.criarLogInicio();

        try {
            const resultados = await this.coletarTodasMoedas();
            logger.info(`📊 Resultados obtidos: ${resultados.length} cotações`);

            if (resultados.length > 0) {
                const salvos = await this.salvarResultados(resultados);
                await this.atualizarLogSucesso(logId, salvos);

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                logger.info(`✅ Coleta finalizada com sucesso! ${salvos} registros salvos em ${duration}s`);
            } else {
                logger.warn('⚠️ Nenhum dado foi coletado da API');
                await this.atualizarLogSucesso(logId, 0);
            }

        } catch (error) {
            logger.error(`❌ Erro na coleta: ${error.message}`);
            await this.atualizarLogErro(logId, error.message);
        } finally {
            this.isRunning = false;
        }
    }

    async coletarTodasMoedas() {
        const resultados = [];

        for (const moeda of this.moedas) {
            try {
                logger.debug(`🌐 Coletando cotação para ${moeda}`);
                const dados = await apiService.getCotacoesAtuais(moeda);

                logger.debug(`📦 Resposta da API para ${moeda}:`, JSON.stringify(dados).substring(0, 200));

                if (dados && dados[moeda]) {
                    const cotacao = dados[moeda];
                    const timestamp = new Date(parseInt(cotacao.timestamp) * 1000);

                    const resultado = {
                        moeda: moeda,
                        bid: parseFloat(cotacao.bid),
                        ask: parseFloat(cotacao.ask),
                        high: parseFloat(cotacao.high),
                        low: parseFloat(cotacao.low),
                        varBid: parseFloat(cotacao.varBid),
                        pctChange: parseFloat(cotacao.pctChange),
                        timestamp: timestamp
                    };

                    resultados.push(resultado);
                    logger.info(`✅ Cotação ${moeda} coletada: Bid=${resultado.bid}, Ask=${resultado.ask}`);
                } else {
                    logger.warn(`⚠️ Dados inválidos para ${moeda}:`, dados);
                }
            } catch (error) {
                logger.error(`❌ Erro ao coletar ${moeda}: ${error.message}`);
                if (error.response) {
                    logger.error(`Status: ${error.response.status}, Data:`, error.response.data);
                }
            }
        }

        return resultados;
    }

    async salvarResultados(resultados) {
        let salvos = 0;

        for (const resultado of resultados) {
            try {
                // Verificar se já existe
                const exists = await prisma.cotacao.findFirst({
                    where: {
                        moeda: resultado.moeda,
                        timestamp: resultado.timestamp
                    }
                });

                if (!exists) {
                    await prisma.cotacao.create({
                        data: resultado
                    });
                    salvos++;
                    logger.debug(`💾 Salvo: ${resultado.moeda} - ${resultado.bid}`);
                } else {
                    logger.debug(`⏭️ Duplicado: ${resultado.moeda} - ${resultado.timestamp}`);
                }
            } catch (error) {
                logger.error(`❌ Erro ao salvar ${resultado.moeda}: ${error.message}`);
            }
        }

        logger.info(`💾 Salvos: ${salvos} de ${resultados.length}`);
        return salvos;
    }

    async criarLogInicio() {
        try {
            const log = await prisma.coletaLog.create({
                data: {
                    moeda: this.moedas.join(','),
                    status: 'processing',
                    startedAt: new Date()
                }
            });
            return log.id;
        } catch (error) {
            logger.error(`❌ Erro ao criar log: ${error.message}`);
            return null;
        }
    }

    async atualizarLogSucesso(logId, registros) {
        if (!logId) return;

        try {
            await prisma.coletaLog.update({
                where: { id: logId },
                data: {
                    status: 'success',
                    registros: registros,
                    finishedAt: new Date()
                }
            });
        } catch (error) {
            logger.error(`❌ Erro ao atualizar log: ${error.message}`);
        }
    }

    async atualizarLogErro(logId, errorMessage) {
        if (!logId) return;

        try {
            await prisma.coletaLog.update({
                where: { id: logId },
                data: {
                    status: 'error',
                    error: errorMessage,
                    finishedAt: new Date()
                }
            });
        } catch (error) {
            logger.error(`❌ Erro ao atualizar log: ${error.message}`);
        }
    }
}

module.exports = new ColetaJob();