const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

// Rotas de previsões
router.get('/simples/:moeda', forecastController.previsaoSimples);
router.get('/media-movel/:moeda', forecastController.previsaoMediaMovel);
router.get('/comparar/:moeda', forecastController.compararPrevisoes);

module.exports = router;