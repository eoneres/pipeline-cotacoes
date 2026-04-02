import React from 'react';
import { formatBRL, formatPercent, formatNumber } from '../utils/formatters';

const StatisticsCards = ({ statistics, moeda }) => {
    if (!statistics) return null;

    const cards = [
        {
            title: 'Cotação Atual',
            value: formatBRL(statistics.cotacao_atual),
            icon: '💰',
            color: '#3b82f6',
            description: 'Valor atual da moeda'
        },
        {
            title: 'Variação Período',
            value: formatPercent(statistics.variacao_periodo),
            icon: '📊',
            color: statistics.variacao_periodo >= 0 ? '#10b981' : '#ef4444',
            description: `Variação em ${statistics.periodo}`
        },
        {
            title: 'Média do Período',
            value: formatBRL(statistics.media_bid),
            icon: '📈',
            color: '#8b5cf6',
            description: 'Média de compra no período'
        },
        {
            title: 'Maior Variação',
            value: formatPercent(statistics.max_pct_change),
            icon: '⚡',
            color: '#f59e0b',
            description: 'Maior variação percentual'
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
        }}>
            {cards.map((card, index) => (
                <div key={index} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${card.color}20`,
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{card.icon}</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>{card.value}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>{card.title}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{card.description}</div>
                </div>
            ))}
        </div>
    );
};

export default StatisticsCards;