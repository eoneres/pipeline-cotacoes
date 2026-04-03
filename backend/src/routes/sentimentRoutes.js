const express = require('express');
const router = express.Router();
const sentimentController = require('../controllers/sentimentController');

// Rotas de análise de sentimento
router.get('/analise/:moeda', sentimentController.analisarSentimento);
router.get('/correlacao/:moeda', sentimentController.correlacionar);
router.get('/relatorio/:moeda', sentimentController.relatorioCompleto);
router.get('/tempo-real/:moeda', sentimentController.analiseTempoReal);

module.exports = router;