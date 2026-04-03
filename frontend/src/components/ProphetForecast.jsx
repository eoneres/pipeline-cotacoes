import React, { useState, useEffect } from 'react';
import { formatBRL, formatDateTime } from '../utils/formatters';

const ProphetForecast = ({ moeda }) => {
    const [previsao, setPrevisao] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [dias, setDias] = useState(30);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (moeda) {
            carregarPrevisao();
        }
    }, [moeda, dias]);

    const carregarPrevisao = async () => {
        setCarregando(true);
        setErro(null);
        try {
            const response = await fetch(`/api/prophet/prever/${moeda}?dias=${dias}`);
            const data = await response.json();
            if (data.success) {
                setPrevisao(data.data);
            } else {
                setErro(data.error || 'Erro ao carregar previsão');
            }
        } catch (error) {
            console.error('Erro ao carregar previsão Prophet:', error);
            setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
        } finally {
            setCarregando(false);
        }
    };

    const getTendenciaInfo = (tendencia) => {
        const info = {
            alta: { cor: '#10b981', icone: '📈', texto: 'Tendência de Alta' },
            baixa: { cor: '#ef4444', icone: '📉', texto: 'Tendência de Baixa' },
            estavel: { cor: '#6b7280', icone: '➡️', texto: 'Tendência Estável' }
        };
        return info[tendencia] || info.estavel;
    };

    if (carregando) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                <p>Executando Prophet... (pode levar alguns segundos)</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Analisando séries temporais e sazonalidade</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '30px',
                border: '1px solid #fee2e2',
                background: '#fef2f2'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                <p style={{ color: '#991b1b', marginBottom: '10px' }}>{erro}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Para usar o Prophet, é necessário instalar Python e as dependências:
                </p>
                <code style={{
                    display: 'block',
                    background: '#1f2937',
                    color: '#10b981',
                    padding: '10px',
                    borderRadius: '8px',
                    marginTop: '10px',
                    fontSize: '12px',
                    textAlign: 'left'
                }}>
                    pip install prophet pandas numpy
                </code>
                <button
                    onClick={carregarPrevisao}
                    style={{
                        marginTop: '20px',
                        padding: '8px 20px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!previsao) {
        return null;
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '30px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🤖</span> Prophet (Facebook) - Previsões Avançadas
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={dias}
                        onChange={(e) => setDias(parseInt(e.target.value))}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            fontSize: '12px'
                        }}
                    >
                        <option value={15}>15 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={60}>60 dias</option>
                        <option value={90}>90 dias</option>
                    </select>
                    <button
                        onClick={carregarPrevisao}
                        style={{
                            padding: '6px 16px',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        🔄 Atualizar
                    </button>
                </div>
            </div>

            {/* Métricas do Modelo */}
            {previsao.metricas && (
                <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Acurácia Estimada</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                {previsao.metricas?.mape ? (100 - previsao.metricas.mape).toFixed(1) : 'N/A'}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Erro Médio (MAE)</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatBRL(previsao.metricas?.mae || 0)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Confiança</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                                {previsao.analise?.confianca_modelo || 'Média'}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tendência */}
            {previsao.analise && (
                <div style={{
                    background: `${getTendenciaInfo(previsao.analise.tendencia).cor}10`,
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: `1px solid ${getTendenciaInfo(previsao.analise.tendencia).cor}30`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{getTendenciaInfo(previsao.analise.tendencia).icone}</span>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: getTendenciaInfo(previsao.analise.tendencia).cor }}>
                                {getTendenciaInfo(previsao.analise.tendencia).texto}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Inclinação: {previsao.analise.inclinacao_tendencia > 0 ? '+' : ''}{previsao.analise.inclinacao_tendencia?.toFixed(6)} por dia
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                Sazonalidade: {previsao.analise.sazonalidade_dominante === 'semanal' ? 'Semanal' : 'Anual'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Previsões */}
            <h4 style={{ marginBottom: '12px' }}>📅 Previsões para os próximos {dias} dias</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Data</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Previsão</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Mínimo</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Máximo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {previsao.previsoes?.map((pred, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '8px 10px', fontSize: '12px' }}>{formatDateTime(pred.data)}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{formatBRL(pred.valor_previsto)}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ef4444' }}>{formatBRL(pred.intervalo_inferior)}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981' }}>{formatBRL(pred.intervalo_superior)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Informação sobre o Prophet */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#0369a1'
            }}>
                <strong>ℹ️ Sobre o Prophet:</strong> Modelo desenvolvido pelo Facebook para previsão de séries temporais.
                Considera sazonalidade (diária, semanal, anual), feriados e tendências não lineares.
                Previsões são apenas estimativas e não garantem resultados futuros.
            </div>
        </div>
    );
};

export default ProphetForecast;