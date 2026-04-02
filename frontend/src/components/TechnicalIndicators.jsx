import React from 'react';
import { interpretarRSI, formatPercent } from '../utils/formatters';

const TechnicalIndicators = ({ rsi, bollinger, ultimoPreco }) => {
    const interpretacao = interpretarRSI(rsi);
    const bandaAtual = bollinger[bollinger.length - 1];

    const posicaoBollinger = () => {
        if (!bandaAtual || !ultimoPreco) return 'neutral';
        if (ultimoPreco > bandaAtual.superior) return 'above';
        if (ultimoPreco < bandaAtual.inferior) return 'below';
        return 'inside';
    };

    const posicao = posicaoBollinger();
    const posicaoInfo = {
        above: { status: 'acima da banda superior', cor: '#ef4444', mensagem: '📈 Ativo muito esticado para cima' },
        below: { status: 'abaixo da banda inferior', cor: '#10b981', mensagem: '📉 Ativo muito esticado para baixo' },
        inside: { status: 'dentro das bandas', cor: '#3b82f6', mensagem: '⚖️ Preço em região normal' }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span> Indicadores Técnicos
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
            }}>
                {/* RSI Card */}
                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#374151' }}>RSI (Relative Strength Index)</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: interpretacao.cor }}>
                            {rsi?.toFixed(1)}
                        </span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            width: `${(rsi / 100) * 100}%`,
                            height: '100%',
                            background: interpretacao.cor,
                            transition: 'width 0.3s'
                        }} />
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                        {interpretacao.mensagem}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {rsi >= 70 ? 'Acima de 70: Sobrecomprado' : rsi <= 30 ? 'Abaixo de 30: Sobrevendido' : 'Neutro (30-70)'}
                    </div>
                </div>

                {/* Bollinger Bands Card */}
                {bandaAtual && (
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
                            Bandas de Bollinger
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Superior:</span>
                                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{bandaAtual.superior?.toFixed(4)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Média (SMA20):</span>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{bandaAtual.media?.toFixed(4)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Inferior:</span>
                                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{bandaAtual.inferior?.toFixed(4)}</span>
                            </div>
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: posicaoInfo[posicao].cor,
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            {posicaoInfo[posicao].mensagem}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicalIndicators;