const { prisma } = require('../config/database');
const logger = require('../config/logger');

class AlertaService {
    constructor() {
        logger.info('🔔 Serviço de alertas inicializado');
    }

    async verificarAlertas() {
        try {
            const alertas = await prisma.alerta.findMany({
                where: { ativo: true }
            });

            if (alertas.length === 0) return;

            logger.info(`🔔 Verificando ${alertas.length} alertas ativos`);

            for (const alerta of alertas) {
                await this.verificarAlerta(alerta);
            }
        } catch (error) {
            logger.error('Erro ao verificar alertas:', error);
        }
    }

    async verificarAlerta(alerta) {
        try {
            const cotacao = await prisma.cotacao.findFirst({
                where: { moeda: alerta.moeda },
                orderBy: { timestamp: 'desc' }
            });

            if (!cotacao) return;

            let disparado = false;
            let valorAtual = cotacao.bid;
            let mensagem = '';

            switch (alerta.tipo) {
                case 'above':
                    if (valorAtual > alerta.valor) {
                        disparado = true;
                        mensagem = `${alerta.nome}: ${alerta.moeda} ultrapassou R$ ${alerta.valor.toFixed(4)} (atual: R$ ${valorAtual.toFixed(4)})`;
                    }
                    break;
                case 'below':
                    if (valorAtual < alerta.valor) {
                        disparado = true;
                        mensagem = `${alerta.nome}: ${alerta.moeda} caiu abaixo de R$ ${alerta.valor.toFixed(4)} (atual: R$ ${valorAtual.toFixed(4)})`;
                    }
                    break;
                case 'percent_change':
                    const umaHoraAtras = new Date();
                    umaHoraAtras.setHours(umaHoraAtras.getHours() - 1);

                    const cotacaoAnterior = await prisma.cotacao.findFirst({
                        where: {
                            moeda: alerta.moeda,
                            timestamp: { lte: umaHoraAtras }
                        },
                        orderBy: { timestamp: 'desc' }
                    });

                    if (cotacaoAnterior) {
                        const variacao = ((valorAtual - cotacaoAnterior.bid) / cotacaoAnterior.bid) * 100;
                        if (Math.abs(variacao) >= alerta.valor) {
                            disparado = true;
                            mensagem = `${alerta.nome}: ${alerta.moeda} variou ${variacao.toFixed(2)}% na última hora`;
                        }
                    }
                    break;
            }

            if (disparado) {
                await this.enviarNotificacao(alerta, mensagem, {
                    valorAtual,
                    bid: cotacao.bid,
                    ask: cotacao.ask,
                    pctChange: cotacao.pctChange
                });
            }
        } catch (error) {
            logger.error(`Erro ao verificar alerta ${alerta.id}:`, error);
        }
    }

    async enviarNotificacao(alerta, mensagem, dados) {
        let status = 'sent';
        let erro = null;

        try {
            switch (alerta.canal) {
                case 'console':
                    logger.info(`🔔 ALERTA: ${mensagem}`);
                    break;

                case 'webhook':
                    if (alerta.destinatario) {
                        try {
                            const axios = require('axios');
                            await axios.post(alerta.destinatario, {
                                alerta: alerta.nome,
                                mensagem,
                                dados,
                                timestamp: new Date().toISOString()
                            });
                            logger.info(`📤 Webhook enviado para ${alerta.destinatario}`);
                        } catch (webhookError) {
                            throw new Error(`Webhook falhou: ${webhookError.message}`);
                        }
                    }
                    break;
            }
        } catch (error) {
            status = 'failed';
            erro = error.message;
            logger.error(`Erro ao enviar notificação: ${error.message}`);
        }

        try {
            await prisma.notificacao.create({
                data: {
                    alertaId: alerta.id,
                    tipo: alerta.tipo,
                    mensagem,
                    dados: JSON.stringify(dados),
                    status,
                    erro
                }
            });
        } catch (error) {
            logger.error('Erro ao registrar notificação:', error);
        }

        await prisma.alerta.update({
            where: { id: alerta.id },
            data: { ultimaNotificacao: new Date() }
        });
    }

    async criarAlerta(dados) {
        return await prisma.alerta.create({
            data: {
                nome: dados.nome,
                moeda: dados.moeda,
                tipo: dados.tipo,
                valor: dados.valor,
                canal: dados.canal || 'console',
                destinatario: dados.destinatario,
                ativo: true
            }
        });
    }

    async listarAlertas(ativo = null) {
        const where = {};
        if (ativo !== null) where.ativo = ativo;

        return await prisma.alerta.findMany({
            where,
            orderBy: { criadoEm: 'desc' }
        });
    }

    async removerAlerta(id) {
        return await prisma.alerta.delete({ where: { id } });
    }

    async listarNotificacoes(limit = 50) {
        const notificacoes = await prisma.notificacao.findMany({
            take: parseInt(limit),
            orderBy: { enviadoEm: 'desc' }
        });

        return notificacoes.map(notif => ({
            ...notif,
            dados: notif.dados ? JSON.parse(notif.dados) : null
        }));
    }
}

module.exports = new AlertaService();