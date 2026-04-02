const exportService = require('../services/exportService');
const logger = require('../config/logger');

const exportController = {
    async exportarCSV(req, res) {
        try {
            const { moeda, startDate, endDate } = req.query;

            const { data, filename, contentType } = await exportService.exportarCSV({
                moeda,
                startDate,
                endDate
            });

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.send(data);
        } catch (error) {
            logger.error('Erro ao exportar CSV:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async exportarExcel(req, res) {
        try {
            const { moeda, startDate, endDate } = req.query;

            const { data, filename, contentType } = await exportService.exportarExcel({
                moeda,
                startDate,
                endDate
            });

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.send(data);
        } catch (error) {
            logger.error('Erro ao exportar Excel:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async relatorioResumo(req, res) {
        try {
            const resumo = await exportService.gerarRelatorioResumo();

            res.json({
                success: true,
                data: resumo,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Erro ao gerar relatório:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

module.exports = exportController;