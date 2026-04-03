const express = require('express');
const router = express.Router();
const prophetController = require('../controllers/prophetController');

router.get('/prever/:moeda', prophetController.preverComProphet);
router.get('/comparar/:moeda', prophetController.compararModelos);
router.get('/componentes/:moeda', prophetController.obterComponentes);

module.exports = router;