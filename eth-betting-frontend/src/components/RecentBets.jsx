import React from 'react';

const RecentBets = () => (
    <div className="glassmorphism rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
            <i className="fas fa-history icon-sm mr-3 text-blue-400"></i>Tus Apuestas Recientes
        </h2>
        <div className="overflow-x-auto">
            <table className="w-full compact-table text-sm">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-left font-medium text-gray-300">Ronda</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-300">Rango</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-300">Monto</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-300">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-800 table-row-hover">
                        <td className="py-3 px-4 font-medium">#456</td>
                        <td className="py-3 px-4">$3700 - $3800</td>
                        <td className="py-3 px-4 text-right font-medium">0.100 ETH</td>
                        <td className="py-3 px-4 text-right">
                            <span className="bg-yellow-900 text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
                                <i className="fas fa-clock icon-sm mr-1"></i>Pendiente
                            </span>
                        </td>
                    </tr>
                    <tr className="border-b border-gray-800 table-row-hover">
                        <td className="py-3 px-4 font-medium">#455</td>
                        <td className="py-3 px-4">$3600 - $3700</td>
                        <td className="py-3 px-4 text-right font-medium">0.050 ETH</td>
                        <td className="py-3 px-4 text-right">
                            <span className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-xs font-medium">
                                <i className="fas fa-times icon-sm mr-1"></i>Perdida
                            </span>
                        </td>
                    </tr>
                    <tr className="table-row-hover">
                        <td className="py-3 px-4 font-medium">#454</td>
                        <td className="py-3 px-4">$3500 - $3600</td>
                        <td className="py-3 px-4 text-right font-medium">0.075 ETH</td>
                        <td className="py-3 px-4 text-right">
                            <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                                <i className="fas fa-check icon-sm mr-1"></i>Ganada
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

export default RecentBets;
