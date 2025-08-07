import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const usePrediction = () => {
    const [prediction, setPrediction] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPrediction = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch historical data from CoinGecko
            const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/ethereum/ohlc?vs_currency=usd&days=1';
            const response = await axios.get(coingeckoUrl);
            const ohlcData = response.data;

            if (!ohlcData || ohlcData.length === 0) {
                throw new Error("No se recibieron datos de CoinGecko.");
            }

            const lastDataPoint = ohlcData[ohlcData.length - 1];
            setCurrentPrice(lastDataPoint[4]);

            const sequence = ohlcData.map(d => [d[1], d[2], d[3], d[4]]);

            // 2. Call the local prediction API using the URL from the config file
            const predictionApiUrl = `${config.API_URL}/predict`;
            const apiResponse = await axios.post(predictionApiUrl, { sequence });

            if (apiResponse.data && apiResponse.data.predicted_price) {
                setPrediction(apiResponse.data.predicted_price);
            } else {
                throw new Error("La respuesta de la API de predicción no fue válida.");
            }

        } catch (err) {
            console.error("Error fetching prediction:", err);
            if (err.code === "ERR_NETWORK") {
                setError(`No se pudo conectar a la API de predicción en ${config.API_URL}. Asegúrate de que el servidor Flask (app.py) esté en ejecución.`);
            } else {
                setError("No se pudo obtener la predicción del modelo ML.");
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchPrediction();
    }, [fetchPrediction]);

    return { prediction, currentPrice, isLoading, error, refreshPrediction: fetchPrediction };
};

export default usePrediction;
