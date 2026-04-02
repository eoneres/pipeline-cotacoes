// Média Móvel Simples
export const calcularSMA = (dados, periodo) => {
    const sma = [];
    for (let i = periodo - 1; i < dados.length; i++) {
        const soma = dados.slice(i - periodo + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push({
            timestamp: dados[i].timestamp,
            value: soma / periodo
        });
    }
    return sma;
};

// Média Móvel Exponencial
export const calcularEMA = (dados, periodo) => {
    const k = 2 / (periodo + 1);
    const ema = [];
    let primeiroSMA = dados.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;
    ema.push({ timestamp: dados[periodo - 1].timestamp, value: primeiroSMA });

    for (let i = periodo; i < dados.length; i++) {
        const valor = (dados[i] - ema[ema.length - 1].value) * k + ema[ema.length - 1].value;
        ema.push({ timestamp: dados[i].timestamp, value: valor });
    }
    return ema;
};

// RSI (Relative Strength Index)
export const calcularRSI = (dados, periodo = 14) => {
    const rsi = [];
    let ganhos = 0;
    let perdas = 0;

    for (let i = 1; i <= periodo; i++) {
        const diferenca = dados[i] - dados[i - 1];
        if (diferenca >= 0) ganhos += diferenca;
        else perdas -= diferenca;
    }

    let mediaGanhos = ganhos / periodo;
    let mediaPerdas = perdas / periodo;
    let rs = mediaGanhos / mediaPerdas;
    let rsiValue = 100 - (100 / (1 + rs));
    rsi.push({ timestamp: dados[periodo].timestamp, value: rsiValue });

    for (let i = periodo + 1; i < dados.length; i++) {
        const diferenca = dados[i] - dados[i - 1];
        if (diferenca >= 0) {
            mediaGanhos = (mediaGanhos * (periodo - 1) + diferenca) / periodo;
            mediaPerdas = (mediaPerdas * (periodo - 1)) / periodo;
        } else {
            mediaGanhos = (mediaGanhos * (periodo - 1)) / periodo;
            mediaPerdas = (mediaPerdas * (periodo - 1) - diferenca) / periodo;
        }
        rs = mediaGanhos / mediaPerdas;
        rsiValue = 100 - (100 / (1 + rs));
        rsi.push({ timestamp: dados[i].timestamp, value: rsiValue });
    }

    return rsi;
};

// Bandas de Bollinger
export const calcularBollinger = (dados, periodo = 20, desvios = 2) => {
    const sma = calcularSMA(dados, periodo);
    const bandas = [];

    for (let i = periodo - 1; i < dados.length; i++) {
        const slice = dados.slice(i - periodo + 1, i + 1);
        const media = slice.reduce((a, b) => a + b, 0) / periodo;
        const variancia = slice.map(v => Math.pow(v - media, 2)).reduce((a, b) => a + b, 0) / periodo;
        const desvioPadrao = Math.sqrt(variancia);

        bandas.push({
            timestamp: dados[i].timestamp,
            superior: media + (desvios * desvioPadrao),
            media: media,
            inferior: media - (desvios * desvioPadrao)
        });
    }

    return bandas;
};

// Interpretar RSI
export const interpretarRSI = (rsi) => {
    if (rsi >= 70) return { status: 'sobrecomprado', cor: '#ef4444', mensagem: '🟢 Possível momento de venda' };
    if (rsi <= 30) return { status: 'sobrevendido', cor: '#10b981', mensagem: '🔴 Possível momento de compra' };
    if (rsi >= 50) return { status: 'neutro-alta', cor: '#f59e0b', mensagem: '⚡ Tendência de alta moderada' };
    return { status: 'neutro-baixa', cor: '#8b5cf6', mensagem: '📊 Mercado sem tendência definida' };
};