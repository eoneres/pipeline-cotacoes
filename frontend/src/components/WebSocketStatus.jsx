import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketStatus = () => {
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updates, setUpdates] = useState(0);
    const [localConnected, setLocalConnected] = useState(false);

    const handleMessage = (message) => {
        setLastUpdate(new Date());
        setUpdates(prev => Math.min(prev + 1, 99));

        if (message.tipo === 'nova_cotacao') {
            console.log(`📈 ${message.dados.moeda}: R$ ${message.dados.bid.toFixed(4)}`);
        }
    };

    const { isConnected } = useWebSocket(handleMessage);

    // Reset contador a cada minuto
    useEffect(() => {
        setLocalConnected(isConnected);
    }, [isConnected]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setUpdates(prev => Math.max(prev - 1, 0));
        }, 60000);
        return () => clearTimeout(timer);
    }, [updates]);

    if (!localConnected) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer'
            }}
                onClick={() => window.location.reload()}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#fef3c7',
                    animation: 'pulse 1.5s infinite'
                }} />
                <span>🔄 Reconectando...</span>
                <span style={{ fontSize: '10px' }}>🔁</span>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'white',
                animation: 'pulse 1.5s infinite'
            }} />
            <span>📡 Tempo Real</span>
            {updates > 0 && (
                <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }}>
                    {updates}
                </span>
            )}
        </div>
    );
};

export default WebSocketStatus;