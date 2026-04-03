/**
 * @swagger
 * tags:
 *   name: Cotações
 *   description: Endpoints para gerenciar cotações de moedas
 */

const express = require('express');
const router = express.Router();
const cotacaoController = require('../controllers/cotacaoController');
const { cotacaoValidations } = require('../utils/validators');

/**
 * @swagger
 * /api/cotacoes:
 *   get:
 *     summary: Lista todas as cotações
 *     tags: [Cotações]
 *     parameters:
 *       - in: query
 *         name: moeda
 *         schema:
 *           type: string
 *         description: Filtrar por moeda (ex: USD-BRL)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Limite de registros
 *     responses:
 *       200:
 *         description: Lista de cotações
 */
router.get('/',
    cotacaoValidations.getCotacoes,
    cotacaoController.listar.bind(cotacaoController)
);

/**
 * @swagger
 * /api/cotacoes/moedas:
 *   get:
 *     summary: Lista todas as moedas disponíveis
 *     tags: [Cotações]
 *     responses:
 *       200:
 *         description: Lista de moedas
 */
router.get('/moedas',
    cotacaoController.listarMoedas.bind(cotacaoController)
);

/**
 * @swagger
 * /api/cotacoes/atuais/{moeda}:
 *   get:
 *     summary: Busca cotação atual de uma moeda
 *     tags: [Cotações]
 *     parameters:
 *       - in: path
 *         name: moeda
 *         required: true
 *         schema:
 *           type: string
 *         description: Par de moedas (ex: USD-BRL)
 *     responses:
 *       200:
 *         description: Cotação atual
 */
router.get('/atuais/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarAtual.bind(cotacaoController)
);

/**
 * @swagger
 * /api/cotacoes/historico/{moeda}:
 *   get:
 *     summary: Busca histórico de cotações
 *     tags: [Cotações]
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
 *           default: 30
 *         description: Número de dias de histórico
 *     responses:
 *       200:
 *         description: Histórico de cotações
 */
router.get('/historico/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarHistorico.bind(cotacaoController)
);

/**
 * @swagger
 * /api/cotacoes/estatisticas/{moeda}:
 *   get:
 *     summary: Calcula estatísticas de uma moeda
 *     tags: [Cotações]
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
 *           default: 30
 *     responses:
 *       200:
 *         description: Estatísticas da moeda
 */
router.get('/estatisticas/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarEstatisticas.bind(cotacaoController)
);

module.exports = router;