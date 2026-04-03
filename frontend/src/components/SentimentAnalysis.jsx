import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/formatters';

const SentimentAnalysis = ({ moeda, cotacaoAtual }) => {
    const [analise, setAnalise] = useState(null);
    const [correlacao, setCorrelacao] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [aba, setAba] = useState('sentimento');
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (moeda) {
            carregarAnalise();
            carregarCorrelacao();
        }
    }, [moeda]);

    const carregarAnalise = async () => {
        setCarregando(true);
        setErro(null);
        try {
            const response = await fetch(`/api/sentiment/analise/${moeda}`);
            const data = await response.json();
            if (data.success) {
                setAnalise(data.data);
            } else {
                setErro(data.error || 'Erro ao carregar análise');
            }
        } catch (error) {
            console.error('Erro ao carregar análise:', error);
            setErro('Erro ao conectar com o servidor');
        } finally {
            setCarregando(false);
        }
    };

    const carregarCorrelacao = async () => {
        try {
            const response = await fetch(`/api/sentiment/correlacao/${moeda}?dias=7`);
            const data = await response.json();
            if (data.success) {
                setCorrelacao(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar correlação:', error);
        }
    };

    const getSentimentoIcone = (sentimento) => {
        const icones = {
            positivo: '📈',
            negativo: '📉',
            neutro: '➡️'
        };
        return icones[sentimento] || '❓';
    };

    const getSentimentoCor = (sentimento) => {
        const cores = {
            positivo: '#10b981',
            negativo: '#ef4444',
            neutro: '#6b7280'
        };
        return cores[sentimento] || '#6b7280';
    };

    const getSentimentoBg = (sentimento) => {
        const cores = {
            positivo: '#d1fae5',
            negativo: '#fee2e2',
            neutro: '#f3f4f6'
        };
        return cores[sentimento] || '#f3f4f6';
    };

    if (carregando) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧠</div>
                <p>Analisando sentimento do mercado...</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Buscando notícias e calculando impacto</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '30px',
                border: '1px solid #fee2e2',
                background: '#fef2f2'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                <p style={{ color: '#991b1b' }}>{erro}</p>
                <button
                    onClick={carregarAnalise}
                    style={{
                        marginTop: '12px',
                        padding: '6px 16px',
                        background: '#ef4444',
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
                    <span>🧠</span> Análise de Sentimento - {moeda}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setAba('sentimento')}
                        style={{
                            padding: '6px 16px',
                            background: aba === 'sentimento' ? '#667eea' : '#f3f4f6',
                            color: aba === 'sentimento' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        📊 Sentimento
                    </button>
                    <button
                        onClick={() => setAba('correlacao')}
                        style={{
                            padding: '6px 16px',
                            background: aba === 'correlacao' ? '#667eea' : '#f3f4f6',
                            color: aba === 'correlacao' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        🔗 Correlação
                    </button>
                </div>
            </div>

            {aba === 'sentimento' && analise && (
                <div>
                    {/* Card de Sentimento Geral */}
                    <div style={{
                        background: getSentimentoBg(analise.sentimento_geral),
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                            {getSentimentoIcone(analise.sentimento_geral)}
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: getSentimentoCor(analise.sentimento_geral),
                            marginBottom: '5px'
                        }}>
                            {analise.classificacao_geral || analise.sentimento_geral.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                            Score: {analise.score_medio?.toFixed(2)} (escala -5 a +5)
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Confiança: {(analise.confianca * 100).toFixed(0)}% | {analise.total_noticias} notícias
                        </div>
                    </div>

                    {/* Notícias Analisadas */}
                    {analise.analises && analise.analises.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '12px', color: '#374151' }}>📰 Notícias Analisadas</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analise.analises.map((item, idx) => (
                                    <div key={idx} style={{
                                        padding: '14px',
                                        background: '#f9fafb',
                                        borderRadius: '10px',
                                        borderLeft: `4px solid ${getSentimentoCor(item.sentimento)}`
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                                            {item.titulo}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                                            {item.fonte} • {formatDateTime(item.data)}
                                        </div>
                                        <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Sentimento:</span>{' '}
                                            <span style={{ color: getSentimentoCor(item.sentimento) }}>
                                                {item.sentimento} (score: {item.score?.toFixed(2)})
                                            </span>
                                        </div>
                                        {item.justificativa && (
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e5e7eb' }}>
                                                📝 {item.justificativa}
                                            </div>
                                        )}
                                        {item.palavras_relevantes && item.palavras_relevantes.length > 0 && (
                                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px' }}>
                                                Palavras-chave: {item.palavras_relevantes.slice(0, 5).map(p => p.palavra).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {aba === 'correlacao' && correlacao && (
                <div>
                    {/* Card de Correlação */}
                    <div style={{
                        background: '#f0f9ff',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Variação Real</div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: parseFloat(correlacao.variacao_real) >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {parseFloat(correlacao.variacao_real) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(correlacao.variacao_real))}%
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>últimos {correlacao.periodo}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Sentimento</div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: getSentimentoCor(correlacao.sentimento)
                                }}>
                                    {getSentimentoIcone(correlacao.sentimento)} {correlacao.classificacao || correlacao.sentimento?.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>Score: {correlacao.score_sentimento?.toFixed(2)}</div>
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px',
                            marginTop: '10px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Interpretação</div>
                            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                {correlacao.interpretacao}
                            </div>
                            <div style={{
                                padding: '10px',
                                background: '#fef3c7',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#92400e'
                            }}>
                                💡 {correlacao.recomendacao}
                            </div>
                        </div>
                    </div>

                    {/* Métricas de Confiança */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px'
                    }}>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                            <div style={{ fontSize: '20px' }}>📊</div>
                            <div style={{ fontWeight: 'bold' }}>{correlacao.forca_correlacao || 'Média'}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Força da Correlação</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                            <div style={{ fontSize: '20px' }}>📰</div>
                            <div style={{ fontWeight: 'bold' }}>{correlacao.total_noticias || 0}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Notícias Analisadas</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                            <div style={{ fontSize: '20px' }}>🎯</div>
                            <div style={{ fontWeight: 'bold', color: getSentimentoCor(correlacao.sentimento) }}>
                                {(correlacao.confianca * 100).toFixed(0)}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Nível de Confiança</div>
                        </div>
                    </div>
                </div>
            )}

            {!analise && !carregando && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧠</div>
                    <p>Nenhum dado de sentimento disponível</p>
                    <button
                        onClick={carregarAnalise}
                        style={{
                            marginTop: '12px',
                            padding: '6px 16px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}
        </div>
    );
};

export default SentimentAnalysis;