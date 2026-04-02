const { body, param, query, validationResult } = require('express-validator');

// Middleware para capturar erros de validação
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        error: 'Erro de validação',
        details: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }))
    });
};

// Validações para cotação
const cotacaoValidations = {
    // Validar parâmetros de consulta de cotações
    getCotacoes: [
        query('moeda')
            .optional()
            .isString()
            .withMessage('Moeda deve ser uma string')
            .matches(/^[A-Z]{3}-[A-Z]{3}$/)
            .withMessage('Formato inválido. Use: USD-BRL, EUR-BRL, etc'),

        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Data inválida. Use formato ISO 8601'),

        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('Data inválida. Use formato ISO 8601'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage('Limit deve ser um número entre 1 e 1000'),

        validate
    ],

    // Validar parâmetros de URL
    moedaParam: [
        param('moeda')
            .notEmpty()
            .withMessage('Moeda é obrigatória')
            .matches(/^[A-Z]{3}-[A-Z]{3}$/)
            .withMessage('Formato inválido. Use: USD-BRL, EUR-BRL, etc'),

        validate
    ]
};

// Validações para coleta
const coletaValidations = {
    // Validar criação de coleta manual
    createColeta: [
        body('moedas')
            .optional()
            .isArray()
            .withMessage('Moedas deve ser um array'),

        validate
    ]
};

module.exports = {
    cotacaoValidations,
    coletaValidations,
    validate
};