import React from 'react';
import { formatNumber, formatPercent, formatBRL } from '../utils/formatters';

const PerformanceMetrics = ({ data, moeda }) => {
    if (!data || data.length === 0) return null;

    // Calcular métricas de performance
    const bids = data.map(d => d.bid);
    const asks = data.map(d => d.ask);
    const pctChanges = data.map(d => d.pctChange);

    const metrics = {
        total_registros: data.length,
        media_bid: bids.reduce((a, b) => a + b, 0) / bids.length,
        media_ask: asks.reduce((a, b) => a + b, 0) / asks.length,
        max_bid: Math.max(...bids),
        min_bid: Math.min(...bids),
        max_ask: Math.max(...asks),
        min_ask: Math.min(...asks),
        max_pct_change: Math.max(...pctChanges),
        min_pct_change: Math.min(...pctChanges),
        volatilidade: Math.sqrt(
            pctChanges.map(p => Math.pow(p - (pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length), 2))
                .reduce((a, b) => a + b, 0) / pctChanges.length
        ),
        amplitude: Math.max(...bids) - Math.min(...bids)
    };

    const metricCards = [
        {
            label: 'Média Compra',
            value: formatBRL(metrics.media_bid),
            icon: '💰',
            color: '#3b82f6',
            desc: 'Média do Bid no período'
        },
        {
            label: 'Média Venda',
            value: formatBRL(metrics.media_ask),
            icon: '💵',
            color: '#ef4444',
            desc: 'Média do Ask no período'
        },
        {
            label: 'Máxima',
            value: formatBRL(metrics.max_bid),
            icon: '📈',
            color: '#10b981',
            desc: 'Maior valor registrado'
        },
        {
            label: 'Mínima',
            value: formatBRL(metrics.min_bid),
            icon: '📉',
            color: '#f59e0b',
            desc: 'Menor valor registrado'
        },
        {
            label: 'Amplitude',
            value: formatBRL(metrics.amplitude),
            icon: '📏',
            color: '#8b5cf6',
            desc: 'Diferença entre máxima e mínima'
        },
        {
            label: 'Volatilidade',
            value: formatPercent(metrics.volatilidade),
            icon: '⚡',
            color: '#ec489a',
            desc: 'Variação média percentual'
        }
    ];

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{
                margin: '0 0 20px 0',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px'
            }}>
                <span>📊</span> Métricas de Performance - {moeda}
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
            }}>
                {metricCards.map((metric, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: 'center',
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            border: `1px solid ${metric.color}20`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{metric.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: metric.color, marginBottom: '4px' }}>
                            {metric.value}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>
                            {metric.label}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>{metric.desc}</div>
                    </div>
                ))}
            </div>

            {/* Informações adicionais */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>📝</span>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>Resumo do Período</span>
                </div>
                <div style={{ fontSize: '13px', color: '#14532d' }}>
                    • Foram analisados {formatNumber(metrics.total_registros, 0)} registros
                    • Variação total de {formatPercent(metrics.max_pct_change - metrics.min_pct_change)}
                    • Spread médio de {formatBRL(metrics.media_ask - metrics.media_bid)}
                </div>
            </div>
        </div>
    );
};

export default PerformanceMetrics;