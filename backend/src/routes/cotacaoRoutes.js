const express = require('express');
const router = express.Router();
const cotacaoController = require('../controllers/cotacaoController');
const { cotacaoValidations } = require('../utils/validators');

// Rotas públicas de cotação
router.get('/',
    cotacaoValidations.getCotacoes,
    cotacaoController.listar.bind(cotacaoController)
);

router.get('/moedas',
    cotacaoController.listarMoedas.bind(cotacaoController)
);

router.get('/atuais/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarAtual.bind(cotacaoController)
);

router.get('/historico/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarHistorico.bind(cotacaoController)
);

router.get('/estatisticas/:moeda',
    cotacaoValidations.moedaParam,
    cotacaoController.buscarEstatisticas.bind(cotacaoController)
);

router.get('/comparar/:moeda1/:moeda2',
    cotacaoValidations.moedaParam,
    cotacaoController.compararMoedas.bind(cotacaoController)
);

module.exports = router;