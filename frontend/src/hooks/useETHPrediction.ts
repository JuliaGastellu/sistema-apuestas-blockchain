import { useState, useEffect, useCallback } from 'react';

type ApiStatus = {
  connected: boolean;
  loading: boolean;
  error: string | null;
  modelInfo: any | null;
};

type Prediction = {
  result: any | null;
  loading: boolean;
  error: string | null;
};

export function useETHPrediction() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    connected: false,
    loading: true,
    error: null,
    modelInfo: null,
  });

  const [prediction, setPrediction] = useState<Prediction>({
    result: null,
    loading: false,
    error: null,
  });

  const API_BASE_URL = 'https://eth-betting-ml.onrender.com';

  const checkAPIStatus = useCallback(async () => {
    setApiStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (!healthResponse.ok) {
        throw new Error(`API Health Check failed: ${healthResponse.status}`);
      }

      const healthData = await healthResponse.json();

      if (healthData.status !== 'healthy' || healthData.model_status !== 'loaded') {
        throw new Error('API no está completamente disponible');
      }

      const infoResponse = await fetch(`${API_BASE_URL}/info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      let modelInfo = null;
      if (infoResponse.ok) {
        modelInfo = await infoResponse.json();
      }

      setApiStatus({
        connected: true,
        loading: false,
        error: null,
        modelInfo: modelInfo,
      });
    } catch (error: any) {
      console.error('Error checking API status:', error);
      setApiStatus({
        connected: false,
        loading: false,
        error: error.message,
        modelInfo: null,
      });
    }
  }, []);

  const makePrediction = useCallback(async (sequenceData: number[][]) => {
    setPrediction((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: sequenceData }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      setPrediction({
        result: result,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error making prediction:', error);
      setPrediction({
        result: null,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  // Efecto inicial para verificar el estado de la API
  useEffect(() => {
    checkAPIStatus();
  }, [checkAPIStatus]);

  // Efecto para verificar periódicamente solo si no está conectada
  useEffect(() => {
    if (apiStatus.connected) return;
    
    const interval = setInterval(() => {
      checkAPIStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [apiStatus.connected, checkAPIStatus]);

  return { apiStatus, prediction, checkAPIStatus, makePrediction };
}
