const cron = require('node-cron');
const alertaService = require('../services/alertaService');
const logger = require('../config/logger');

class AlertaJob {
    constructor() {
        this.schedule = '*/1 * * * *';
        this.isRunning = false;
    }

    start() {
        if (this.schedule && this.schedule !== '') {
            logger.info(`🔔 Iniciando job de alertas com schedule: ${this.schedule}`);

            this.task = cron.schedule(this.schedule, async () => {
                if (this.isRunning) return;
                this.isRunning = true;
                try {
                    await alertaService.verificarAlertas();
                } finally {
                    this.isRunning = false;
                }
            });

            logger.info('✅ Job de alertas agendado com sucesso');
        }
    }

    stop() {
        if (this.task) {
            this.task.stop();
            logger.info('⏹️ Job de alertas parado');
        }
    }
}

module.exports = new AlertaJob();