import React from 'react';

const SystemStatus = ({ currentPrice }) => (
    <div className="glassmorphism rounded-xl compact-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-server icon-sm mr-3 text-purple-400"></i>Estado del Sistema
        </h2>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Precio ETH</span>
                <span className="font-bold text-lg">
                    {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Cargando...'}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Conexión</span>
                <div className="connection-indicator">
                    <span className="status-dot status-online pulse-dot"></span>
                    <span className="font-medium text-green-400 text-sm">Online</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">API Status</span>
                <div className="connection-indicator">
                    <span className="status-dot status-online"></span>
                    <span className="font-medium text-green-400 text-sm">Activa</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Datos</span>
                <span className="font-medium text-blue-400 text-sm">24 puntos</span>
            </div>
        </div>
    </div>
);

export default SystemStatus;
