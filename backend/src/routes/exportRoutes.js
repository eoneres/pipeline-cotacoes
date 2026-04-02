const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Rotas de exportação
router.get('/csv', exportController.exportarCSV);
router.get('/excel', exportController.exportarExcel);
router.get('/relatorio', exportController.relatorioResumo);

module.exports = router;