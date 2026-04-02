const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');

// Rotas de alertas
router.get('/', alertaController.listar);
router.post('/', alertaController.criar);
router.delete('/:id', alertaController.remover);
router.get('/notificacoes', alertaController.listarNotificacoes);

module.exports = router;