import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const useWebSocket = (onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        // Função para conectar
        const connect = () => {
            if (socketRef.current?.connected) {
                console.log('⚠️ WebSocket já conectado');
                return;
            }

            console.log('🔌 Conectando ao WebSocket...');

            const socket = io('http://localhost:3001', {
                transports: ['websocket', 'polling'], // Tentar polling como fallback
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 10000,
                autoConnect: true,
                forceNew: true
            });

            socket.on('connect', () => {
                console.log('✅ WebSocket conectado! ID:', socket.id);
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            });

            socket.on('disconnect', (reason) => {
                console.log('🔌 WebSocket desconectado. Razão:', reason);
                setIsConnected(false);

                if (reason === 'io server disconnect') {
                    setTimeout(() => {
                        if (socketRef.current && !socketRef.current.connected) {
                            console.log('🔄 Tentando reconectar manualmente...');
                            socketRef.current.connect();
                        }
                    }, 1000);
                }
            });

            socket.on('connect_error', (error) => {
                console.error('❌ Erro de conexão WebSocket:', error.message);
                setIsConnected(false);
                reconnectAttemptsRef.current++;

                if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.warn('⚠️ Máximo de tentativas de reconexão atingido. WebSocket pode estar indisponível.');
                }
            });

            socket.on('welcome', (data) => {
                console.log('👋 Bem-vindo ao WebSocket:', data.message);
            });

            socket.on('nova_cotacao', (data) => {
                console.log('📈 Nova cotação recebida:', data.dados.moeda, 'R$', data.dados.bid);
                setLastMessage(data);
                if (onMessage && typeof onMessage === 'function') {
                    onMessage(data);
                }
            });

            socket.on('coleta_finalizada', (data) => {
                console.log('✅ Coleta finalizada:', data);
                setLastMessage(data);
                if (onMessage && typeof onMessage === 'function') {
                    onMessage(data);
                }
            });

            socket.on('alerta_disparado', (data) => {
                console.log('🔔 Alerta disparado:', data);
                setLastMessage(data);
                if (onMessage && typeof onMessage === 'function') {
                    onMessage(data);
                }
            });

            socketRef.current = socket;
        };

        connect();

        return () => {
            if (socketRef.current) {
                console.log('🔌 Desconectando WebSocket...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // Array vazio

    const sendMessage = (event, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('⚠️ WebSocket não conectado, mensagem não enviada');
        }
    };

    const subscribe = (tipo, moeda = null) => {
        sendMessage('subscribe', { tipo, moeda });
    };

    const unsubscribe = (tipo, moeda = null) => {
        sendMessage('unsubscribe', { tipo, moeda });
    };

    return {
        isConnected,
        lastMessage,
        sendMessage,
        subscribe,
        unsubscribe
    };
};

export default useWebSocket;