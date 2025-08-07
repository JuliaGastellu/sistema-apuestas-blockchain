import React, { useState, useEffect } from 'react';
import moment from 'moment';

const Countdown = ({ targetTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = moment.unix(Math.floor(Date.now() / 1000));
            const target = moment.unix(targetTime);
            const duration = moment.duration(target.diff(now));

            if (duration.asSeconds() <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(interval);
                return;
            }

            const hours = String(duration.hours()).padStart(2, '0');
            const minutes = String(duration.minutes()).padStart(2, '0');
            const seconds = String(duration.seconds()).padStart(2, '0');
            setTimeLeft(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    return <p className="font-bold text-sm text-yellow-400">{timeLeft || 'Calculando...'}</p>;
};


const CurrentRound = ({ roundData }) => {
    if (!roundData) {
        return (
            <div className="glassmorphism rounded-xl compact-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="fas fa-trophy icon-sm mr-3 text-yellow-400"></i>Ronda Actual
                </h2>
                <p>Cargando datos de la ronda...</p>
            </div>
        );
    }

    return (
        <div className="glassmorphism rounded-xl compact-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-trophy icon-sm mr-3 text-yellow-400"></i>Ronda #{roundData.id}
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="metric-card">
                    <p className="text-gray-400 text-xs mb-1">Tiempo restante</p>
                    <Countdown targetTime={roundData.targetTime} />
                </div>
                <div className="metric-card">
                    <p className="text-gray-400 text-xs mb-1">Pool total</p>
                    <p className="font-bold text-sm text-purple-400">{parseFloat(roundData.totalPool).toFixed(4)} ETH</p>
                </div>
                <div className="metric-card">
                    <p className="text-gray-400 text-xs mb-1">Estado</p>
                    <p className={`font-bold text-sm ${roundData.resolved ? 'text-red-400' : 'text-green-400'}`}>
                        {roundData.resolved ? 'Resuelta' : 'Activa'}
                    </p>
                </div>
                <div className="metric-card">
                    <p className="text-gray-400 text-xs mb-1">Participantes</p>
                    <p className="font-bold text-sm">--</p>
                </div>
            </div>
            <div className="flex space-x-3">
                <button className="flex-1 glassmorphism hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all">
                    <i className="fas fa-eye icon-sm mr-1"></i>Ver detalles
                </button>
                <button className="flex-1 btn-elegant text-white py-2 px-3 rounded-lg text-xs font-medium">
                    <i className="fas fa-coins icon-sm mr-1"></i>Apostar
                </button>
            </div>
        </div>
    );
}

export default CurrentRound;
