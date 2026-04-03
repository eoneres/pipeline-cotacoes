import React, { useState, useEffect } from 'react';
import AlertaManager from './components/AlertaManager';
import ForecastPanel from './components/ForecastPanel';
import PriceChart from './components/PriceChart';
import PerformanceMetrics from './components/PerformanceMetrics';
import WebSocketStatus from './components/WebSocketStatus';
import SentimentAnalysis from './components/SentimentAnalysis';
import useWebSocket from './hooks/useWebSocket';
import {
    formatBRL,
    formatPercent,
    formatDateTime,
    getMoedaNome,
    getMoedaSimbolo,
    getMoedaBandeira,
    formatNumber
} from './utils/formatters';

function App() {
    const [loading, setLoading] = useState(true);
    const [exportando, setExportando] = useState(false);
    const [dados, setDados] = useState({
        moedas: [],
        cotacoes: {},
        estatisticas: {},
        ultimasColetas: []
    });
    const [selectedMoeda, setSelectedMoeda] = useState('USD-BRL');
    const [historico, setHistorico] = useState([]);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [chartType, setChartType] = useState('line');
    const [estatisticas, setEstatisticas] = useState(null);

    // WebSocket para atualizações em tempo real
    const handleWebSocketMessage = (message) => {
        if (message.tipo === 'nova_cotacao') {
            const novaCotacao = message.dados;
            setDados(prev => ({
                ...prev,
                cotacoes: {
                    ...prev.cotacoes,
                    [novaCotacao.moeda]: {
                        bid: novaCotacao.bid,
                        ask: novaCotacao.ask,
                        high: novaCotacao.high,
                        low: novaCotacao.low,
                        pctChange: novaCotacao.pctChange,
                        timestamp: novaCotacao.timestamp
                    }
                }
            }));

            const variacao = novaCotacao.pctChange;
            const sinal = variacao >= 0 ? '▲' : '▼';
            const cor = variacao >= 0 ? '#10b981' : '#ef4444';

            const notification = document.createElement('div');
            notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid ${cor};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
            notification.innerHTML = `
        <strong style="color: ${cor}">${sinal} ${novaCotacao.moeda}</strong><br>
        <span style="font-size: 16px; font-weight: bold;">R$ ${novaCotacao.bid.toFixed(4)}</span><br>
        <span style="color: ${cor}">Variação: ${sinal} ${Math.abs(variacao).toFixed(2)}%</span>
      `;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        } else if (message.tipo === 'coleta_finalizada') {
            carregarDados();
            carregarHistorico(selectedMoeda);
            carregarEstatisticas(selectedMoeda);
        }
    };

    const { isConnected } = useWebSocket(handleWebSocketMessage);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        if (selectedMoeda) {
            carregarHistorico(selectedMoeda);
            carregarEstatisticas(selectedMoeda);
        }
    }, [selectedMoeda]);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const moedasRes = await fetch('/api/cotacoes/moedas');
            const moedasData = await moedasRes.json();

            const dashboardRes = await fetch('/api/dashboard/resumo');
            const dashboardData = await dashboardRes.json();

            setDados({
                moedas: moedasData.data || [],
                cotacoes: dashboardData.data?.cotações_atuais || {},
                estatisticas: dashboardData.data?.estatisticas_gerais || {},
                ultimasColetas: dashboardData.data?.ultimas_coletas || []
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const carregarHistorico = async (moeda) => {
        setCarregandoHistorico(true);
        try {
            const response = await fetch(`/api/cotacoes/historico/${moeda}?dias=30`);
            const data = await response.json();
            setHistorico(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setCarregandoHistorico(false);
        }
    };

    const carregarEstatisticas = async (moeda) => {
        try {
            const response = await fetch(`/api/cotacoes/estatisticas/${moeda}?dias=30`);
            const data = await response.json();
            if (data.success) {
                setEstatisticas(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const dispararColetaManual = async () => {
        try {
            const response = await fetch('/api/coletas/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Coleta manual disparada com sucesso!');
                setTimeout(() => carregarDados(), 2000);
            }
        } catch (error) {
            console.error('Erro ao disparar coleta:', error);
            alert('❌ Erro ao disparar coleta manual');
        }
    };

    const exportarCSV = async () => {
        setExportando(true);
        try {
            const response = await fetch('/api/export/csv');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cotacoes_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            alert('✅ Exportação concluída!');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            alert('❌ Erro ao exportar CSV');
        } finally {
            setExportando(false);
        }
    };

    const exportarExcel = async () => {
        setExportando(true);
        try {
            const response = await fetch('/api/export/excel');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cotacoes_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            alert('✅ Exportação concluída!');
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            alert('❌ Erro ao exportar Excel');
        } finally {
            setExportando(false);
        }
    };

    const getVariacaoClasse = (variacao) => {
        const numVariacao = typeof variacao === 'string' ? parseFloat(variacao) : (variacao || 0);
        if (numVariacao > 0) return { bg: '#d1fae5', color: '#065f46', icon: '▲' };
        if (numVariacao < 0) return { bg: '#fee2e2', color: '#991b1b', icon: '▼' };
        return { bg: '#e5e7eb', color: '#6b7280', icon: '●' };
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                    <h2>Carregando Pipeline de Cotações...</h2>
                    <p>Aguardando dados do backend</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px 0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px' }}>📊 Pipeline de Cotações</h1>
                            <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Monitoramento de moedas em tempo real</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                marginRight: '5px'
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: isConnected ? '#10b981' : '#ef4444',
                                    animation: isConnected ? 'pulse 1.5s infinite' : 'none'
                                }} />
                                <span style={{ fontSize: '12px' }}>
                                    {isConnected ? '📡 Tempo Real' : '🔄 Reconectando...'}
                                </span>
                            </div>
                            <button
                                onClick={dispararColetaManual}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                🔄 Coleta Manual
                            </button>
                            <button
                                onClick={exportarCSV}
                                disabled={exportando}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: exportando ? 'not-allowed' : 'pointer',
                                    opacity: exportando ? 0.6 : 1,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => !exportando && (e.target.style.transform = 'scale(1.05)')}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                📄 {exportando ? 'Exportando...' : 'Exportar CSV'}
                            </button>
                            <button
                                onClick={exportarExcel}
                                disabled={exportando}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: exportando ? 'not-allowed' : 'pointer',
                                    opacity: exportando ? 0.6 : 1,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => !exportando && (e.target.style.transform = 'scale(1.05)')}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                📊 {exportando ? 'Exportando...' : 'Exportar Excel'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '10px 24px',
                            border: 'none',
                            background: activeTab === 'dashboard' ? '#667eea' : 'transparent',
                            color: activeTab === 'dashboard' ? 'white' : '#6b7280',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        📈 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('alertas')}
                        style={{
                            padding: '10px 24px',
                            border: 'none',
                            background: activeTab === 'alertas' ? '#667eea' : 'transparent',
                            color: activeTab === 'alertas' ? 'white' : '#6b7280',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔔 Alertas
                    </button>
                    <button
                        onClick={() => setActiveTab('previsoes')}
                        style={{
                            padding: '10px 24px',
                            border: 'none',
                            background: activeTab === 'previsoes' ? '#667eea' : 'transparent',
                            color: activeTab === 'previsoes' ? 'white' : '#6b7280',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        🤖 Previsões
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Cards de Estatísticas */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Total de Cotações</div>
                                    <span style={{ fontSize: '24px' }}>📊</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
                                    {formatNumber(dados.estatisticas.total_cotacoes_hoje || 0, 0)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
                                    registros nas últimas 24h
                                </div>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Moedas Monitoradas</div>
                                    <span style={{ fontSize: '24px' }}>💱</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginTop: '10px' }}>
                                    {dados.moedas.length}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {dados.moedas.join(', ')}
                                </div>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Última Coleta</div>
                                    <span style={{ fontSize: '24px' }}>⏰</span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginTop: '10px' }}>
                                    {formatDateTime(dados.estatisticas.ultima_atualizacao)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '5px' }}>
                                    ✅ Sistema operacional
                                </div>
                            </div>
                        </div>

                        {/* Cotações Atuais */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ marginBottom: '20px', color: '#374151', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>📈</span> Cotações em Tempo Real
                                {isConnected && <span style={{ fontSize: '12px', background: '#10b98120', padding: '2px 8px', borderRadius: '20px', color: '#10b981' }}>● Ao vivo</span>}
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                                gap: '20px'
                            }}>
                                {Object.entries(dados.cotacoes).map(([moeda, cotacao]) => {
                                    const variacaoStyle = getVariacaoClasse(cotacao.pctChange);
                                    return (
                                        <div key={moeda} style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            border: '1px solid #e5e7eb'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                            }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                        <span style={{ fontSize: '28px' }}>{getMoedaBandeira(moeda)}</span>
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>
                                                                {getMoedaNome(moeda)}
                                                            </h3>
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                {moeda}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    background: variacaoStyle.bg,
                                                    color: variacaoStyle.color
                                                }}>
                                                    {variacaoStyle.icon} {formatPercent(cotacao.pctChange)}
                                                </span>
                                            </div>

                                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
                                                    {formatBRL(cotacao.bid)}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                                                    1 {getMoedaSimbolo(moeda)} = {formatBRL(cotacao.bid)}
                                                </div>
                                            </div>

                                            <div style={{
                                                marginTop: '20px',
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '12px',
                                                paddingTop: '15px',
                                                borderTop: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Compra (Bid)</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#059669' }}>{formatBRL(cotacao.bid)}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Venda (Ask)</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#dc2626' }}>{formatBRL(cotacao.ask)}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Máxima (High)</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{formatBRL(cotacao.high)}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Mínima (Low)</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{formatBRL(cotacao.low)}</div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '15px', fontSize: '10px', color: '#9ca3af', textAlign: 'right', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                                                🕒 Atualizado: {formatDateTime(cotacao.timestamp)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Análise de Sentimento */}
                        <SentimentAnalysis
                            moeda={selectedMoeda}
                            cotacaoAtual={dados.cotacoes[selectedMoeda]?.bid}
                        />

                        {/* Estatísticas Cards */}
                        {estatisticas && (
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px'
                                }}>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{formatBRL(estatisticas.cotacao_atual)}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Cotação Atual</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: estatisticas.variacao_periodo >= 0 ? '#10b981' : '#ef4444' }}>
                                            {formatPercent(estatisticas.variacao_periodo)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Variação 30 dias</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>{formatBRL(estatisticas.media_bid)}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Média 30 dias</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{formatPercent(estatisticas.max_pct_change)}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Maior Variação</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seletor de Tipo de Gráfico */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            flexWrap: 'wrap',
                            gap: '15px',
                            marginTop: '20px'
                        }}>
                            <h2 style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
                                <span>📈</span> Análise Gráfica
                            </h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setChartType('line')}
                                    style={{
                                        padding: '8px 20px',
                                        background: chartType === 'line' ? '#3b82f6' : '#f3f4f6',
                                        color: chartType === 'line' ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    📈 Linha
                                </button>
                                <button
                                    onClick={() => setChartType('area')}
                                    style={{
                                        padding: '8px 20px',
                                        background: chartType === 'area' ? '#3b82f6' : '#f3f4f6',
                                        color: chartType === 'area' ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    🎨 Área
                                </button>
                                <button
                                    onClick={() => setChartType('candlestick')}
                                    style={{
                                        padding: '8px 20px',
                                        background: chartType === 'candlestick' ? '#3b82f6' : '#f3f4f6',
                                        color: chartType === 'candlestick' ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    🕯️ Velas
                                </button>
                            </div>
                        </div>

                        {/* Gráfico */}
                        <div style={{ marginBottom: '30px' }}>
                            <PriceChart
                                data={historico}
                                type={chartType}
                                title={`Evolução - ${selectedMoeda}`}
                                height={450}
                            />
                        </div>

                        {/* Métricas de Performance */}
                        {historico.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                                <PerformanceMetrics data={historico} moeda={selectedMoeda} />
                            </div>
                        )}

                        {/* Histórico */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                <h2 style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>📉</span> Histórico de Cotações (Últimos 30 dias)
                                </h2>
                                <select
                                    value={selectedMoeda}
                                    onChange={(e) => setSelectedMoeda(e.target.value)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1px solid #d1d5db',
                                        background: 'white',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {dados.moedas.map(moeda => (
                                        <option key={moeda} value={moeda}>
                                            {getMoedaBandeira(moeda)} {getMoedaNome(moeda)} ({moeda})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {carregandoHistorico ? (
                                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                                    <p>Carregando histórico...</p>
                                </div>
                            ) : historico.length > 0 ? (
                                <div style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'auto',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data/Hora</th>
                                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Compra (Bid)</th>
                                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Venda (Ask)</th>
                                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Máxima</th>
                                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Mínima</th>
                                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Variação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historico.slice(0, 30).map((item, index) => {
                                                const variacaoStyle = getVariacaoClasse(item.pctChange);
                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                                        <td style={{ padding: '12px 15px', fontSize: '13px' }}>{formatDateTime(item.timestamp)}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '500' }}>{formatBRL(item.bid)}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '500' }}>{formatBRL(item.ask)}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', color: '#059669' }}>{formatBRL(item.high)}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', color: '#dc2626' }}>{formatBRL(item.low)}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: variacaoStyle.color }}>
                                                            {variacaoStyle.icon} {formatPercent(item.pctChange)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {historico.length > 30 && (
                                        <div style={{ padding: '12px', textAlign: 'center', background: '#f9fafb', fontSize: '12px', color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
                                            Mostrando 30 de {historico.length} registros
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                                    <p style={{ color: '#6b7280' }}>Nenhum dado de histórico disponível para {selectedMoeda}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>Aguarde a próxima coleta automática ou clique em "Coleta Manual"</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Alertas Tab */}
                {activeTab === 'alertas' && (
                    <AlertaManager moedas={dados.moedas} />
                )}

                {/* Previsões Tab */}
                {activeTab === 'previsoes' && (
                    <ForecastPanel moeda={selectedMoeda} />
                )}
            </div>

            {/* Componente de status WebSocket */}
            <WebSocketStatus />

            {/* CSS para animações */}
            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
        </div>
    );
}

export default App;