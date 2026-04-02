import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const CustomLineChart = ({ data, lines = [] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Nenhum dado disponível</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${value}`, 'Valor']}
                />
                <Legend />
                {lines.map((line, index) => (
                    <Line
                        key={index}
                        type="monotone"
                        dataKey={line.dataKey}
                        stroke={line.color}
                        name={line.name}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CustomLineChart;