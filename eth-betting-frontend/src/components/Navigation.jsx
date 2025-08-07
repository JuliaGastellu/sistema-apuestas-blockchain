import React from 'react';

const Navigation = ({ view, setView, isAdmin }) => (
  <div className="glassmorphism rounded-xl p-1 mb-8 flex backdrop-blur-lg">
    <button onClick={() => setView('dashboard')} className={`nav-pill flex-1 py-3 px-4 rounded-lg text-center text-sm font-medium ${view === 'dashboard' ? 'active' : 'text-gray-300'}`}>
      <i className="fas fa-tachometer-alt icon-sm mr-2"></i>Dashboard
    </button>
    <button onClick={() => setView('betting')} className={`nav-pill flex-1 py-3 px-4 rounded-lg text-center text-sm font-medium ${view === 'betting' ? 'active' : 'text-gray-300'}`}>
      <i className="fas fa-dice icon-sm mr-2"></i>Apuestas
    </button>
    {isAdmin && (
        <button onClick={() => setView('admin')} className={`nav-pill flex-1 py-3 px-4 rounded-lg text-center text-sm font-medium ${view === 'admin' ? 'active' : 'text-gray-300'}`}>
            <i className="fas fa-cog icon-sm mr-2"></i>Admin
        </button>
    )}
  </div>
);

export default Navigation;
