/**
 * @swagger
 * tags:
 *   name: Alertas
 *   description: Sistema de alertas configuráveis
 */

const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');

/**
 * @swagger
 * /api/alertas:
 *   get:
 *     summary: Lista todos os alertas
 *     tags: [Alertas]
 *     responses:
 *       200:
 *         description: Lista de alertas
 *   post:
 *     summary: Cria um novo alerta
 *     tags: [Alertas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alerta'
 *     responses:
 *       200:
 *         description: Alerta criado com sucesso
 *       400:
 *         description: Dados inválidos
 *   delete:
 *     summary: Remove um alerta
 *     tags: [Alertas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerta removido
 */
router.get('/', alertaController.listar.bind(alertaController));
router.post('/', alertaController.criar.bind(alertaController));
router.delete('/:id', alertaController.remover.bind(alertaController));
router.get('/notificacoes', alertaController.listarNotificacoes.bind(alertaController));

module.exports = router;