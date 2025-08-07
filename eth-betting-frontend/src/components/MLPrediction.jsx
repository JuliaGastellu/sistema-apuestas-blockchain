import React from 'react';

const MLPrediction = ({ prediction, currentPrice, isLoading, refreshPrediction }) => {

    const expectedChange = prediction && currentPrice ? ((prediction - currentPrice) / currentPrice) * 100 : 0;
    const isPositive = expectedChange >= 0;

    const renderPrediction = () => {
        if (isLoading) {
            return <span className="font-bold">Cargando predicción...</span>;
        }
        if (!prediction) {
            return <span className="font-bold text-red-400">No disponible</span>;
        }
        return (
            <div className="flex items-center">
                <span className={`font-bold mr-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ${prediction.toFixed(2)}
                </span>
                <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} ${isPositive ? 'text-green-400' : 'text-red-400'} icon-sm`}></i>
            </div>
        );
    };

    return (
        <div className="gradient-border rounded-xl compact-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-brain icon-sm mr-3 text-indigo-400"></i>Predicción ML
            </h2>
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Precio actual</span>
                    <span className="font-bold">
                        {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Cargando...'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Predicción</span>
                    {renderPrediction()}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Cambio esperado</span>
                    {prediction && currentPrice ? (
                        <span className={isPositive ? 'price-change-positive' : 'price-change-negative'}>
                            {isPositive ? '+' : ''}{expectedChange.toFixed(2)}%
                        </span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            </div>
            <div className="flex space-x-3">
                <button
                    onClick={refreshPrediction}
                    disabled={isLoading}
                    className="flex-1 glassmorphism hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all"
                >
                    <i className={`fas fa-sync-alt icon-sm mr-1 ${isLoading ? 'fa-spin' : ''}`}></i>
                    {isLoading ? 'Actualizando' : 'Actualizar'}
                </button>
                <button disabled className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:shadow-lg transition-all opacity-50 cursor-not-allowed">
                    <i className="fas fa-calculator icon-sm mr-1"></i>Analizar
                </button>
            </div>
        </div>
    );
};

export default MLPrediction;
