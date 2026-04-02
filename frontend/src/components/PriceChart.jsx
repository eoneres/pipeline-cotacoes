import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Bar
} from 'recharts';
import { formatBRL, formatDateTime } from '../utils/formatters';

const PriceChart = ({ data, type = 'line', title, height = 450 }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                borderRadius: '12px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                    <p style={{ color: '#6b7280' }}>Nenhum dado disponível para o gráfico</p>
                </div>
            </div>
        );
    }

    // Preparar dados para o gráfico
    const chartData = data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        }),
        hora: new Date(item.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestampCompleto: new Date(item.timestamp).toLocaleString('pt-BR'),
        bid: Number(item.bid),
        ask: Number(item.ask),
        high: Number(item.high),
        low: Number(item.low)
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Encontrar o item correspondente para mostrar hora completa
            const item = chartData.find(d => d.timestamp === label);
            return (
                <div style={{
                    background: 'white',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    minWidth: '200px'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#374151' }}>
                        {item?.timestampCompleto || label}
                    </p>
                    {payload.map((p, index) => (
                        <p key={index} style={{ margin: '4px 0', color: p.color, fontSize: '13px' }}>
                            <strong>{p.name}:</strong> {formatBRL(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 60 }
        };

        switch (type) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAsk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => formatBRL(value)}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ paddingBottom: '10px' }}
                        />
                        <Area type="monotone" dataKey="bid" stroke="#3b82f6" fill="url(#colorBid)" name="Compra (Bid)" strokeWidth={2} />
                        <Area type="monotone" dataKey="ask" stroke="#ef4444" fill="url(#colorAsk)" name="Venda (Ask)" strokeWidth={2} />
                    </AreaChart>
                );

            case 'candlestick':
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => formatBRL(value)}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ paddingBottom: '10px' }}
                        />
                        <Bar dataKey="high" fill="#10b981" name="Máxima (High)" barSize={8} />
                        <Bar dataKey="low" fill="#f59e0b" name="Mínima (Low)" barSize={8} />
                        <Line type="monotone" dataKey="bid" stroke="#3b82f6" strokeWidth={2} name="Compra (Bid)" dot={false} />
                        <Line type="monotone" dataKey="ask" stroke="#ef4444" strokeWidth={2} name="Venda (Ask)" dot={false} />
                    </ComposedChart>
                );

            default: // line chart
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="timestamp"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => formatBRL(value)}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ paddingBottom: '10px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="bid"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            name="Compra (Bid)"
                            dot={{ r: 3, fill: '#3b82f6' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="ask"
                            stroke="#ef4444"
                            strokeWidth={2.5}
                            name="Venda (Ask)"
                            dot={{ r: 3, fill: '#ef4444' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            {title && (
                <h3 style={{
                    margin: '0 0 24px 0',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '18px'
                }}>
                    <span>📈</span> {title}
                </h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;