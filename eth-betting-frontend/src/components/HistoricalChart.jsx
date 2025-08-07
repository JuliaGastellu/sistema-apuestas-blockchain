import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const HistoricalChart = () => {
    const [data, setData] = useState([]);
    const [layout, setLayout] = useState({});

    useEffect(() => {
        const historicalData = [];
        const basePrice = 3784;
        const timestamps = [];

        for (let i = 0; i < 24; i++) {
            const variation = (Math.random() - 0.5) * 120;
            const trend = Math.sin(i * 0.3) * 50;
            const price = basePrice + variation + trend;
            historicalData.push(price);
            timestamps.push(`${23-i}h`);
        }

        historicalData.reverse();
        timestamps.reverse();

        const trace = {
            x: timestamps,
            y: historicalData,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: '#8B5CF6',
                width: 3,
                shape: 'spline'
            },
            fill: 'tonexty',
            fillcolor: 'rgba(139, 92, 246, 0.1)',
            name: 'ETH Price'
        };

        setData([trace]);

        setLayout({
            height: 220,
            margin: {t: 20, b: 40, l: 60, r: 20},
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {color: '#e5e7eb', size: 11},
            xaxis: {
                showgrid: false,
                showline: true,
                linecolor: 'rgba(156, 163, 175, 0.3)'
            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(156, 163, 175, 0.1)',
                showline: true,
                linecolor: 'rgba(156, 163, 175, 0.3)'
            },
            showlegend: false,
            hovermode: 'x unified'
        });
    }, []);

    return (
        <div className="glassmorphism rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                    <i className="fas fa-chart-line icon-sm mr-3 text-purple-400"></i>Precio Histórico ETH
                </h2>
                <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                    Últimas 24 horas
                </div>
            </div>
            <Plot
                data={data}
                layout={layout}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default HistoricalChart;
