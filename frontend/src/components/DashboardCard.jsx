import React from 'react';

const DashboardCard = ({ title, value, icon, color = 'primary', change }) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-green-100 text-green-600',
        danger: 'bg-red-100 text-red-600',
        warning: 'bg-yellow-100 text-yellow-600',
    };

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-bold mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                        </p>
                    )}
                </div>
                <div className={`${colors[color]} p-3 rounded-full`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;