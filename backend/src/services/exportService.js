const { prisma } = require('../config/database');
const logger = require('../config/logger');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

class ExportService {
    /**
     * Exporta cotações para CSV
     */
    async exportarCSV(filtros = {}) {
        try {
            const cotacoes = await this.buscarCotacoesParaExport(filtros);

            const fields = ['moeda', 'bid', 'ask', 'high', 'low', 'pctChange', 'timestamp'];
            const parser = new Parser({ fields });
            const csv = parser.parse(cotacoes);

            return {
                data: csv,
                filename: `cotacoes_${new Date().toISOString().slice(0, 19)}.csv`,
                contentType: 'text/csv'
            };
        } catch (error) {
            logger.error('Erro ao exportar CSV:', error);
            throw error;
        }
    }

    /**
     * Exporta cotações para Excel
     */
    async exportarExcel(filtros = {}) {
        try {
            const cotacoes = await this.buscarCotacoesParaExport(filtros);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cotações');

            // Cabeçalhos
            worksheet.columns = [
                { header: 'Moeda', key: 'moeda', width: 15 },
                { header: 'Compra (Bid)', key: 'bid', width: 15 },
                { header: 'Venda (Ask)', key: 'ask', width: 15 },
                { header: 'Máxima', key: 'high', width: 15 },
                { header: 'Mínima', key: 'low', width: 15 },
                { header: 'Variação %', key: 'pctChange', width: 12 },
                { header: 'Data/Hora', key: 'timestamp', width: 20 }
            ];

            // Dados
            cotacoes.forEach(cotacao => {
                worksheet.addRow({
                    moeda: cotacao.moeda,
                    bid: cotacao.bid,
                    ask: cotacao.ask,
                    high: cotacao.high,
                    low: cotacao.low,
                    pctChange: cotacao.pctChange,
                    timestamp: cotacao.timestamp
                });
            });

            // Estilizar cabeçalho
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            };

            const buffer = await workbook.xlsx.writeBuffer();

            return {
                data: buffer,
                filename: `cotacoes_${new Date().toISOString().slice(0, 19)}.xlsx`,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } catch (error) {
            logger.error('Erro ao exportar Excel:', error);
            throw error;
        }
    }

    /**
     * Busca cotações para exportação
     */
    async buscarCotacoesParaExport(filtros) {
        const { moeda, startDate, endDate, limit = 10000 } = filtros;

        const where = {};
        if (moeda) where.moeda = moeda;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        return await prisma.cotacao.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit)
        });
    }

    /**
     * Gera relatório resumido
     */
    async gerarRelatorioResumo() {
        const moedas = await prisma.cotacao.findMany({
            select: { moeda: true },
            distinct: ['moeda']
        });

        const resumo = [];

        for (const { moeda } of moedas) {
            const stats = await prisma.cotacao.aggregate({
                where: { moeda },
                _avg: { bid: true, ask: true },
                _max: { bid: true, high: true },
                _min: { bid: true, low: true },
                _count: true
            });

            const ultimaCotacao = await prisma.cotacao.findFirst({
                where: { moeda },
                orderBy: { timestamp: 'desc' }
            });

            resumo.push({
                moeda,
                total_registros: stats._count,
                media_compra: stats._avg.bid,
                media_venda: stats._avg.ask,
                maximo: stats._max.bid,
                minimo: stats._min.bid,
                ultima_cotacao: ultimaCotacao?.bid,
                ultima_atualizacao: ultimaCotacao?.timestamp
            });
        }

        return resumo;
    }
}

module.exports = new ExportService();