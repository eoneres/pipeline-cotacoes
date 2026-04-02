const express = require('express');
const router = express.Router();
const coletaController = require('../controllers/coletaController');
const { coletaValidations } = require('../utils/validators');

// Rotas de coleta
router.post('/manual',
    coletaValidations.createColeta,
    coletaController.dispararColetaManual.bind(coletaController)
);

router.get('/logs',
    coletaController.listarLogs.bind(coletaController)
);

router.get('/logs/ultima',
    coletaController.buscarUltimaColeta.bind(coletaController)
);

router.get('/estatisticas',
    coletaController.buscarEstatisticasColeta.bind(coletaController)
);

module.exports = router;