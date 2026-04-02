import React, { useState, useEffect } from 'react';
import { formatDateTime, formatBRL, formatPercent, getMoedaBandeira, getMoedaNome } from '../utils/formatters';

const AlertaManager = ({ moedas }) => {
    const [alertas, setAlertas] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [novoAlerta, setNovoAlerta] = useState({
        nome: '',
        moeda: moedas[0] || '',
        tipo: 'above',
        valor: '',
        canal: 'console',
        destinatario: ''
    });

    useEffect(() => {
        carregarAlertas();
        carregarNotificacoes();
    }, []);

    const carregarAlertas = async () => {
        try {
            const response = await fetch('/api/alertas');
            const data = await response.json();
            setAlertas(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
        }
    };

    const carregarNotificacoes = async () => {
        try {
            const response = await fetch('/api/alertas/notificacoes');
            const data = await response.json();
            setNotificacoes(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    };

    const criarAlerta = async () => {
        if (!novoAlerta.nome || !novoAlerta.valor) {
            alert('❌ Preencha nome e valor do alerta');
            return;
        }

        setCarregando(true);
        try {
            const response = await fetch('/api/alertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...novoAlerta,
                    valor: parseFloat(novoAlerta.valor)
                })
            });

            if (response.ok) {
                alert('✅ Alerta criado com sucesso!');
                setShowForm(false);
                carregarAlertas();
                setNovoAlerta({
                    nome: '',
                    moeda: moedas[0],
                    tipo: 'above',
                    valor: '',
                    canal: 'console',
                    destinatario: ''
                });
            } else {
                const error = await response.json();
                alert(`❌ Erro: ${error.error || 'Falha ao criar alerta'}`);
            }
        } catch (error) {
            console.error('Erro ao criar alerta:', error);
            alert('❌ Erro ao criar alerta');
        } finally {
            setCarregando(false);
        }
    };

    const removerAlerta = async (id) => {
        if (!confirm('⚠️ Remover este alerta permanentemente?')) return;

        try {
            await fetch(`/api/alertas/${id}`, { method: 'DELETE' });
            carregarAlertas();
            alert('✅ Alerta removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover alerta:', error);
            alert('❌ Erro ao remover alerta');
        }
    };

    const getTipoLabel = (tipo) => {
        const tipos = {
            above: 'Acima de',
            below: 'Abaixo de',
            percent_change: 'Variação Percentual'
        };
        return tipos[tipo];
    };

    const getTipoIcone = (tipo) => {
        const icones = {
            above: '📈',
            below: '📉',
            percent_change: '🔄'
        };
        return icones[tipo];
    };

    const getCanalIcone = (canal) => {
        const icones = {
            console: '💻',
            email: '📧',
            webhook: '🌐'
        };
        return icones[canal] || '🔔';
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h2 style={{ color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🔔</span> Gerenciar Alertas
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
                        Receba notificações quando as cotações atingirem valores específicos
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm ? '#ef4444' : '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {showForm ? '✕ Cancelar' : '+ Criar Alerta'}
                </button>
            </div>

            {/* Formulário */}
            {showForm && (
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#374151' }}>Configurar Novo Alerta</h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                            Nome do Alerta
                        </label>
                        <input
                            type="text"
                            value={novoAlerta.nome}
                            onChange={(e) => setNovoAlerta({ ...novoAlerta, nome: e.target.value })}
                            placeholder="Ex: Alerta USD Acima de R$ 5,50"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                                Moeda
                            </label>
                            <select
                                value={novoAlerta.moeda}
                                onChange={(e) => setNovoAlerta({ ...novoAlerta, moeda: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            >
                                {moedas.map(moeda => (
                                    <option key={moeda} value={moeda}>
                                        {getMoedaBandeira(moeda)} {getMoedaNome(moeda)} ({moeda})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                                Tipo de Alerta
                            </label>
                            <select
                                value={novoAlerta.tipo}
                                onChange={(e) => setNovoAlerta({ ...novoAlerta, tipo: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="above">📈 Acima de (valor)</option>
                                <option value="below">📉 Abaixo de (valor)</option>
                                <option value="percent_change">🔄 Variação Percentual (%)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                                {novoAlerta.tipo === 'percent_change' ? 'Variação (%)' : 'Valor (R$)'}
                            </label>
                            <input
                                type="number"
                                step={novoAlerta.tipo === 'percent_change' ? '0.1' : '0.01'}
                                value={novoAlerta.valor}
                                onChange={(e) => setNovoAlerta({ ...novoAlerta, valor: e.target.value })}
                                placeholder={novoAlerta.tipo === 'percent_change' ? 'Ex: 5' : 'Ex: 5.50'}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                                Canal de Notificação
                            </label>
                            <select
                                value={novoAlerta.canal}
                                onChange={(e) => setNovoAlerta({ ...novoAlerta, canal: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="console">💻 Console (Log)</option>
                                <option value="webhook">🌐 Webhook (URL)</option>
                            </select>
                        </div>
                    </div>

                    {novoAlerta.canal === 'webhook' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
                                URL do Webhook
                            </label>
                            <input
                                type="text"
                                placeholder="https://meu-sistema.com/webhook"
                                value={novoAlerta.destinatario}
                                onChange={(e) => setNovoAlerta({ ...novoAlerta, destinatario: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px'
                                }}
                            />
                            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>
                                O webhook receberá um POST com os dados do alerta
                            </p>
                        </div>
                    )}

                    <button
                        onClick={criarAlerta}
                        disabled={carregando}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            cursor: carregando ? 'not-allowed' : 'pointer',
                            width: '100%',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            transition: 'all 0.2s',
                            opacity: carregando ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => !carregando && (e.target.style.transform = 'scale(1.01)')}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        {carregando ? '⏳ Criando...' : '✅ Criar Alerta'}
                    </button>
                </div>
            )}

            {/* Lista de Alertas */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔔</span> Alertas Ativos ({alertas.length})
                </h3>
                {alertas.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px dashed #d1d5db'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔕</div>
                        <p style={{ color: '#6b7280', marginBottom: '5px' }}>Nenhum alerta configurado</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Clique em "Criar Alerta" para começar a monitorar as cotações
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alertas.map(alerta => (
                            <div key={alerta.id} style={{
                                background: 'white',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '20px' }}>{getTipoIcone(alerta.tipo)}</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>
                                            {alerta.nome}
                                        </span>
                                        <span style={{
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            background: '#d1fae5',
                                            color: '#065f46'
                                        }}>
                                            Ativo
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span>{getMoedaBandeira(alerta.moeda)} {alerta.moeda}</span>
                                        <span>{getTipoLabel(alerta.tipo)} {alerta.tipo === 'percent_change' ? `${alerta.valor}%` : formatBRL(alerta.valor)}</span>
                                        <span>{getCanalIcone(alerta.canal)} {alerta.canal === 'webhook' ? alerta.destinatario?.substring(0, 30) : alerta.canal}</span>
                                        {alerta.ultimaNotificacao && (
                                            <span>🕒 Última: {formatDateTime(alerta.ultimaNotificacao)}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removerAlerta(alerta.id)}
                                    style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notificações Recentes */}
            {notificacoes.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📋</span> Últimas Notificações
                    </h3>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f9fafb' }}>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Data/Hora</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Mensagem</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notificacoes.slice(0, 15).map((notif, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>
                                            {formatDateTime(notif.enviadoEm)}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px' }}>{notif.mensagem}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                background: notif.status === 'sent' ? '#d1fae5' : '#fee2e2',
                                                color: notif.status === 'sent' ? '#065f46' : '#991b1b'
                                            }}>
                                                {notif.status === 'sent' ? '✅ Enviado' : '❌ Falhou'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {notificacoes.length > 15 && (
                            <div style={{ padding: '12px', textAlign: 'center', background: '#f9fafb', fontSize: '12px', color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
                                Mostrando 15 de {notificacoes.length} notificações
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertaManager;