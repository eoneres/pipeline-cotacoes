// Mapeamento de moedas com informações detalhadas
export const moedaInfo = {
    'USD-BRL': { nome: 'Dólar Americano', simbolo: 'USD', pais: 'Estados Unidos', bandeira: '🇺🇸', codigo: 840 },
    'EUR-BRL': { nome: 'Euro', simbolo: 'EUR', pais: 'Zona do Euro', bandeira: '🇪🇺', codigo: 978 },
    'GBP-BRL': { nome: 'Libra Esterlina', simbolo: 'GBP', pais: 'Reino Unido', bandeira: '🇬🇧', codigo: 826 },
    'ARS-BRL': { nome: 'Peso Argentino', simbolo: 'ARS', pais: 'Argentina', bandeira: '🇦🇷', codigo: 32 },
    'JPY-BRL': { nome: 'Iene Japonês', simbolo: 'JPY', pais: 'Japão', bandeira: '🇯🇵', codigo: 392 },
    'CAD-BRL': { nome: 'Dólar Canadense', simbolo: 'CAD', pais: 'Canadá', bandeira: '🇨🇦', codigo: 124 },
    'AUD-BRL': { nome: 'Dólar Australiano', simbolo: 'AUD', pais: 'Austrália', bandeira: '🇦🇺', codigo: 36 },
    'CHF-BRL': { nome: 'Franco Suíço', simbolo: 'CHF', pais: 'Suíça', bandeira: '🇨🇭', codigo: 756 },
    'CNY-BRL': { nome: 'Yuan Chinês', simbolo: 'CNY', pais: 'China', bandeira: '🇨🇳', codigo: 156 },
    'BRL-USD': { nome: 'Real Americano', simbolo: 'BRL', pais: 'Brasil', bandeira: '🇧🇷', codigo: 986 }
};

// Formatar cotação (valor em Reais com 4 casas decimais)
export const formatCotacao = (value) => {
    if (!value && value !== 0) return '0,0000';
    // Garantir que é número
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0,0000';
    return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
};

// Formatar moeda brasileira (R$)
export const formatBRL = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    // Garantir que é número
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
};

// Formatar percentual - CORRIGIDO
export const formatPercent = (value) => {
    if (value === undefined || value === null) return '0%';
    // Garantir que é número
    let numValue;
    if (typeof value === 'string') {
        numValue = parseFloat(value);
    } else if (typeof value === 'number') {
        numValue = value;
    } else {
        numValue = 0;
    }
    if (isNaN(numValue)) return '0%';
    const sinal = numValue >= 0 ? '+' : '';
    return `${sinal}${numValue.toFixed(2)}%`;
};

// Formatar data e hora
export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        });
    } catch (error) {
        return 'N/A';
    }
};

// Formatar data apenas
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('pt-BR');
    } catch (error) {
        return 'N/A';
    }
};

// Obter nome completo da moeda
export const getMoedaNome = (moeda) => {
    return moedaInfo[moeda]?.nome || moeda;
};

// Obter símbolo da moeda
export const getMoedaSimbolo = (moeda) => {
    return moedaInfo[moeda]?.simbolo || moeda?.split('-')[0] || 'USD';
};

// Obter bandeira
export const getMoedaBandeira = (moeda) => {
    return moedaInfo[moeda]?.bandeira || '🌍';
};

// Obter país
export const getMoedaPais = (moeda) => {
    return moedaInfo[moeda]?.pais || 'Desconhecido';
};

// Calcular variação entre duas cotações
export const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    const numAtual = typeof atual === 'string' ? parseFloat(atual) : atual;
    const numAnterior = typeof anterior === 'string' ? parseFloat(anterior) : anterior;
    if (isNaN(numAtual) || isNaN(numAnterior)) return 0;
    return ((numAtual - numAnterior) / numAnterior) * 100;
};

// Formatar número com separador de milhar
export const formatNumber = (value, decimals = 2) => {
    if (!value && value !== 0) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};