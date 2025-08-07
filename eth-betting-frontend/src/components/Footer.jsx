import React from 'react';

const Footer = () => (
    <footer className="text-center text-gray-400 text-sm mt-12 pt-6 border-t border-gray-800">
        <div className="flex justify-center items-center space-x-4 mb-2">
            <i className="fab fa-ethereum text-purple-400"></i>
            <span>ETH Price Betting ML</span>
            <i className="fas fa-brain text-indigo-400"></i>
        </div>
        <p className="text-xs">
            Datos en tiempo real de Binance • Predicciones con modelos LSTM avanzados
        </p>
    </footer>
);

export default Footer;
