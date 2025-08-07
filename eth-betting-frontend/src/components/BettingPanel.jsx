import React, { useState } from 'react';

const BettingPanel = ({ rangesData, onPlaceBet }) => {
    const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
    const [amount, setAmount] = useState('0.01');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!onPlaceBet) return;

        setIsLoading(true);
        setFeedback('Enviando transacción...');
        setError('');

        try {
            await onPlaceBet(selectedRangeIndex, amount);
            setFeedback('¡Apuesta realizada con éxito!');
            setTimeout(() => setFeedback(''), 3000);
        } catch (err) {
            setError(err.message || 'Ocurrió un error al realizar la apuesta.');
            setFeedback('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glassmorphism rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
                <i className="fas fa-coins icon-sm mr-3 text-yellow-400"></i>Realizar Apuesta
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-300 text-sm mb-2 font-medium">Rango de precio</label>
                        <select
                            value={selectedRangeIndex}
                            onChange={(e) => setSelectedRangeIndex(parseInt(e.target.value))}
                            className="w-full glassmorphism text-white border-gray-600 rounded-lg compact-input focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            {rangesData && rangesData.map((range, index) => (
                                <option key={index} value={index}>
                                    ${parseFloat(range.minPrice).toFixed(0)} - ${parseFloat(range.maxPrice).toFixed(0)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm mb-2 font-medium">Monto (ETH)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0.001"
                            className="w-full glassmorphism text-white border-gray-600 rounded-lg compact-input focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full btn-elegant text-white py-3 rounded-lg font-semibold text-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin icon-sm mr-2"></i>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane icon-sm mr-2"></i>
                                    Apostar {amount} ETH
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
            {feedback && (
                <div className="feedback-message text-sm text-center text-green-400 p-3 rounded-lg">
                    {feedback}
                </div>
            )}
            {error && (
                <div className="feedback-message text-sm text-center text-red-400 p-3 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
};

export default BettingPanel;
