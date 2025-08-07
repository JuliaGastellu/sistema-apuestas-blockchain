import React from 'react';

const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const Header = ({ account, balance, connectWallet, error }) => (
  <header className="flex flex-col md:flex-row justify-between items-center mb-8">
    <div className="flex items-center mb-4 md:mb-0">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl mr-4 shadow-lg">
        <i className="fab fa-ethereum text-white text-lg"></i>
      </div>
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          ETH Price Betting
        </h1>
        <p className="text-purple-300 text-sm font-light">Predicciones ML y apuestas inteligentes</p>
      </div>
    </div>
    <div className="flex flex-col items-end">
        {account ? (
            <div className="text-right glassmorphism rounded-lg p-3">
                <p className="text-xs text-gray-300 mb-1">Conectado como</p>
                <p className="font-mono text-xs text-purple-300 truncate max-w-xs" title={account}>
                    {formatAddress(account)}
                </p>
                <p className="mt-2 text-sm">
                    Balance: <span className="font-bold text-green-400">{parseFloat(balance).toFixed(4)} ETH</span>
                </p>
            </div>
        ) : (
            <button onClick={connectWallet} className="btn-elegant text-white py-2 px-6 rounded-lg font-semibold text-sm">
                Conectar Billetera
            </button>
        )}
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  </header>
);

export default Header;
