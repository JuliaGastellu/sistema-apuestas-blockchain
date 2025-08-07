import React, { useState } from 'react';
import './App.css';
import useWallet from './hooks/useWallet';
import useBettingContract from './hooks/useBettingContract';
import usePrediction from './hooks/usePrediction';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Betting from './components/Betting';
import Admin from './components/Admin';
import Footer from './components/Footer';

function App() {
  const [view, setView] = useState('dashboard');
  const { account, balance, provider, signer, error: walletError, connectWallet } = useWallet();
  const { owner, roundData, rangesData, placeBet, reloadData, error: contractError } = useBettingContract(provider, signer, account);
  const { prediction, currentPrice, isLoading: isPredictionLoading, error: predictionError, refreshPrediction } = usePrediction();

  const isAdmin = account && owner && account.toLowerCase() === owner.toLowerCase();

  const handleBetPlaced = async (rangeIndex, amount) => {
    await placeBet(rangeIndex, amount);
    reloadData();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header account={account} balance={balance} connectWallet={connectWallet} error={walletError || contractError || predictionError} />
        <Navigation view={view} setView={setView} isAdmin={isAdmin} />

        <main>
          {view === 'dashboard' && <Dashboard roundData={roundData} rangesData={rangesData} prediction={prediction} currentPrice={currentPrice} isPredictionLoading={isPredictionLoading} refreshPrediction={refreshPrediction} />}
          {view === 'betting' && <Betting roundData={roundData} rangesData={rangesData} onPlaceBet={handleBetPlaced} />}
          {view === 'admin' && isAdmin && <Admin />}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
