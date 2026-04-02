const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rotas do dashboard
router.get('/resumo',
    dashboardController.resumo.bind(dashboardController)
);

router.get('/evolucao',
    dashboardController.evolucao.bind(dashboardController)
);

router.get('/top-variacoes',
    dashboardController.topVariacoes.bind(dashboardController)
);

module.exports = router;