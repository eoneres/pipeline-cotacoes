/**
 * @swagger
 * tags:
 *   name: Previsões
 *   description: Previsões com Machine Learning
 */

const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

/**
 * @swagger
 * /api/forecast/simples/{moeda}:
 *   get:
 *     summary: Previsão usando Regressão Linear
 *     tags: [Previsões]
 *     parameters:
 *       - in: path
 *         name: moeda
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Previsões geradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Previsao'
 */
router.get('/simples/:moeda', forecastController.previsaoSimples);

/**
 * @swagger
 * /api/forecast/media-movel/{moeda}:
 *   get:
 *     summary: Previsão usando Média Móvel
 *     tags: [Previsões]
 *     parameters:
 *       - in: path
 *         name: moeda
 *         required: true
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 7
 *       - in: query
 *         name: janela
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Previsões geradas
 */
router.get('/media-movel/:moeda', forecastController.previsaoMediaMovel);

/**
 * @swagger
 * /api/forecast/comparar/{moeda}:
 *   get:
 *     summary: Compara diferentes métodos de previsão
 *     tags: [Previsões]
 *     responses:
 *       200:
 *         description: Comparação entre métodos
 */
router.get('/comparar/:moeda', forecastController.compararPrevisoes);

module.exports = router;