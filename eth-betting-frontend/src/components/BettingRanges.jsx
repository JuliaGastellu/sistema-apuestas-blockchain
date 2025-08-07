import React from 'react';

const BettingRanges = ({ rangesData, totalPool }) => {

    const calculateProbability = (rangeTotalBets, totalPool) => {
        if (!totalPool || totalPool === '0.0' || !rangeTotalBets) return '0.0%';
        const probability = (parseFloat(rangeTotalBets) / parseFloat(totalPool)) * 100;
        return probability.toFixed(1) + '%';
    };

    if (!rangesData || rangesData.length === 0) {
        return (
            <div className="glassmorphism rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <i className="fas fa-list-ol icon-sm mr-3 text-indigo-400"></i>Rangos de Apuestas
                </h2>
                <p>Cargando rangos de apuestas...</p>
            </div>
        );
    }

    return (
        <div className="glassmorphism rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                    <i className="fas fa-list-ol icon-sm mr-3 text-indigo-400"></i>Rangos de Apuestas
                </h2>
                <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                    Total: <span className="text-purple-400 font-medium">{totalPool ? parseFloat(totalPool).toFixed(4) : '0.00'} ETH</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full compact-table text-sm">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="py-3 px-4 text-left font-medium text-gray-300">Rango de Precio</th>
                            <th className="py-3 px-4 text-right font-medium text-gray-300">Total Apostado</th>
                            <th className="py-3 px-4 text-right font-medium text-gray-300">Tu Apuesta</th>
                            <th className="py-3 px-4 text-right font-medium text-gray-300">Probabilidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rangesData.map((range, index) => (
                            <tr key={index} className={`betting-range-row table-row-hover border-b border-gray-800 ${parseFloat(range.userBet) > 0 ? 'selected' : ''}`}>
                                <td className="py-3 px-4 font-semibold">${parseFloat(range.minPrice).toFixed(0)} - ${parseFloat(range.maxPrice).toFixed(0)}</td>
                                <td className="py-3 px-4 text-right">{parseFloat(range.totalBets).toFixed(4)} ETH</td>
                                <td className={`py-3 px-4 text-right ${parseFloat(range.userBet) > 0 ? 'font-semibold text-purple-400' : 'text-gray-500'}`}>
                                    {parseFloat(range.userBet) > 0 ? `${parseFloat(range.userBet).toFixed(4)} ETH` : '-'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-xs">
                                        {calculateProbability(range.totalBets, totalPool)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BettingRanges;
