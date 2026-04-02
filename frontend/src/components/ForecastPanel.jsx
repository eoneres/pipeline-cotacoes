import React, { useState } from 'react';
import { formatBRL, formatDateTime, formatPercent } from '../utils/formatters';

const ForecastPanel = ({ moeda }) => {
    const [previsao, setPrevisao] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [metodo, setMetodo] = useState('simples');
    const [dias, setDias] = useState(7);
    const [erro, setErro] = useState(null);

    const carregarPrevisao = async () => {
        setCarregando(true);
        setErro(null);

        try {
            let url;
            if (metodo === 'simples') {
                url = `/api/forecast/simples/${moeda}?dias=${dias}`;
            } else if (metodo === 'media-movel') {
                url = `/api/forecast/media-movel/${moeda}?dias=${dias}&janela=7`;
            } else {
                url = `/api/forecast/comparar/${moeda}?dias=${dias}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPrevisao(data.data);
            } else {
                setErro(data.error);
            }
        } catch (error) {
            console.error('Erro ao carregar previsão:', error);
            setErro('Erro ao carregar previsão. Verifique se há dados suficientes.');
        } finally {
            setCarregando(false);
        }
    };

    const getConfiancaCor = (acuracia) => {
        if (acuracia >= 70) return { bg: '#d1fae5', color: '#065f46', texto: 'Alta' };
        if (acuracia >= 40) return { bg: '#fef3c7', color: '#92400e', texto: 'Média' };
        return { bg: '#fee2e2', color: '#991b1b', texto: 'Baixa' };
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '30px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🤖</span> Previsões com Machine Learning
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            fontSize: '14px'
                        }}
                    >
                        <option value="simples">Regressão Linear</option>
                        <option value="media-movel">Média Móvel</option>
                        <option value="comparar">Comparar Métodos</option>
                    </select>

                    <select
                        value={dias}
                        onChange={(e) => setDias(parseInt(e.target.value))}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            fontSize: '14px'
                        }}
                    >
                        <option value={3}>3 dias</option>
                        <option value={5}>5 dias</option>
                        <option value={7}>7 dias</option>
                        <option value={10}>10 dias</option>
                        <option value={14}>14 dias</option>
                    </select>

                    <button
                        onClick={carregarPrevisao}
                        disabled={carregando}
                        style={{
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            cursor: carregando ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            opacity: carregando ? 0.6 : 1
                        }}
                    >
                        {carregando ? '⏳ Calculando...' : '🔮 Gerar Previsão'}
                    </button>
                </div>
            </div>

            {erro && (
                <div style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <strong>⚠️ Erro:</strong> {erro}
                </div>
            )}

            {previsao && (
                <div>
                    {/* Métricas do Modelo */}
                    {previsao.modelo && (
                        <div style={{
                            background: '#f9fafb',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>📊 Qualidade do Modelo</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '15px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Método</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{previsao.modelo.tipo || previsao.metodo || 'Regressão Linear'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>R² (Coeficiente)</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                        {previsao.modelo.r_quadrado ? (previsao.modelo.r_quadrado * 100).toFixed(1) : 'N/A'}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Acurácia Estimada</div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        color: getConfiancaCor(previsao.modelo.acuracia).color
                                    }}>
                                        {previsao.modelo.acuracia ? previsao.modelo.acuracia.toFixed(1) : 'N/A'}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Confiança</div>
                                    <div>
                                        <span style={{
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: getConfiancaCor(previsao.modelo.acuracia).bg,
                                            color: getConfiancaCor(previsao.modelo.acuracia).color
                                        }}>
                                            {getConfiancaCor(previsao.modelo.acuracia).texto}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Análise e Recomendação */}
                    {previsao.analise && (
                        <div style={{
                            background: `linear-gradient(135deg, ${previsao.analise.corTendencia}10 0%, white 100%)`,
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: `1px solid ${previsao.analise.corTendencia}30`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '28px' }}>{previsao.analise.iconeTendencia}</span>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: previsao.analise.corTendencia }}>
                                        Tendência de {previsao.analise.tendencia.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                        {previsao.analise.mensagem}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                padding: '12px',
                                background: 'white',
                                borderRadius: '8px',
                                marginTop: '10px'
                            }}>
                                <strong>💡 Recomendação:</strong> {previsao.analise.recomendacao}
                            </div>
                        </div>
                    )}

                    {/* Previsões */}
                    <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>📅 Previsões para os próximos {dias} dias</h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '12px'
                    }}>
                        {previsao.previsoes && previsao.previsoes.map((pred, idx) => (
                            <div key={idx} style={{
                                background: '#f9fafb',
                                padding: '15px',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                    Dia {pred.dia} • {formatDateTime(pred.data)}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
                                    {formatBRL(pred.valor)}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    Intervalo: {formatBRL(pred.intervaloInferior)} - {formatBRL(pred.intervaloSuperior)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Informações adicionais */}
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#0369a1'
                    }}>
                        <strong>ℹ️ Sobre a previsão:</strong> Este modelo usa {previsao.modelo?.tipo || 'Regressão Linear'} baseada nos últimos {previsao.dados_historicos?.total_registros || 30} registros.
                        Previsões são apenas estimativas e não garantem resultados futuros.
                    </div>
                </div>
            )}

            {!previsao && !carregando && !erro && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#6b7280'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔮</div>
                    <p>Clique em "Gerar Previsão" para ver as estimativas baseadas em Machine Learning</p>
                    <p style={{ fontSize: '12px' }}>O modelo analisa tendências históricas e projeta valores futuros</p>
                </div>
            )}

            {carregando && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                    <p>Calculando previsões...</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Analisando padrões históricos</p>
                </div>
            )}
        </div>
    );
};

export default ForecastPanel;