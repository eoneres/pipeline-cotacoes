/**
 * Formata um valor para moeda brasileira
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata um valor percentual
 */
function formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

/**
 * Formata data para formato brasileiro
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(new Date(date));
}

/**
 * Normaliza string de moeda (ex: USD-BRL)
 */
function normalizeMoeda(moeda) {
    return moeda.toUpperCase().trim().replace(/\s/g, '');
}

/**
 * Valida formato de moeda
 */
function isValidMoeda(moeda) {
    const regex = /^[A-Z]{3}-[A-Z]{3}$/;
    return regex.test(moeda);
}

module.exports = {
    formatCurrency,
    formatPercent,
    formatDate,
    normalizeMoeda,
    isValidMoeda
};