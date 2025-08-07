import torch
import torch.nn as nn
import pandas as pd
import numpy as np
import requests
import json
import os
import logging
import hashlib
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
import sklearn.preprocessing._data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

torch.serialization.add_safe_globals([
    sklearn.preprocessing._data.MinMaxScaler,
    sklearn.preprocessing._data.RobustScaler,
    np._core.multiarray._reconstruct,
    np.ndarray,
    np.dtype,
    np.float64,
    np.int64,
    dict,
    list,
    tuple
])

# MCP - Genera hash SHA256 del modelo
def generate_model_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

MODEL_PATH = 'ml/eth_price_model.pth'
MODEL_HASH = generate_model_hash(MODEL_PATH)
MODEL_VERSION = "v1.0.0"

class ETHPriceLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=2, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout)
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, 1)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.relu(self.fc1(out))
        out = self.dropout(out)
        out = self.fc2(out)
        return out

def load_model():
    """Carga el modelo y el scaler desde checkpoint."""
    path = MODEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Modelo no encontrado en {path}")

    checkpoint = torch.load(path, weights_only=False, map_location='cpu')
    scaler = checkpoint['scaler']
    model_state = checkpoint['model_state_dict']

    input_size = 4
    model = ETHPriceLSTM(input_size=input_size)
    model.load_state_dict(model_state)
    model.eval()

    return model, scaler

def get_current_eth_price():
    """Obtiene precio ETH actual desde Binance."""
    try:
        url = "https://api.binance.com/api/v3/ticker/price"
        response = requests.get(url, params={'symbol': 'ETHUSDT'}, timeout=10)
        response.raise_for_status()
        price = float(response.json()['price'])
        logger.info(f"Precio actual Binance: ${price:.2f}")
        return price
    except Exception as e:
        logger.error(f"Error obteniendo precio de Binance: {e}")
        try:
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {'ids': 'ethereum', 'vs_currencies': 'usd'}
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            price = float(response.json()['ethereum']['usd'])
            logger.info(f"Precio actual CoinGecko: ${price:.2f}")
            return price
        except Exception as e2:
            logger.error(f"Error obteniendo precio de CoinGecko: {e2}")
            return 3500.0

def get_eth_historical_data(hours=200):
    """Descarga datos históricos horarios de ETH de Binance."""
    try:
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = end_time - hours * 60 * 60 * 1000

        url = "https://api.binance.com/api/v3/klines"
        params = {
            'symbol': 'ETHUSDT',
            'interval': '1h',
            'startTime': start_time,
            'endTime': end_time,
            'limit': min(1000, hours)
        }

        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        df = pd.DataFrame(data, columns=[
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base', 'taker_buy_quote', 'ignore'
        ])

        df['timestamp'] = pd.to_datetime(df['open_time'], unit='ms')
        df['price'] = df['close'].astype(float)
        df['volume'] = df['volume'].astype(float)

        df['returns'] = df['price'].pct_change().fillna(0)
        df['log_returns'] = np.log(df['price'] / df['price'].shift(1)).fillna(0)

        df = df[['timestamp', 'price', 'volume', 'returns', 'log_returns']].sort_values('timestamp')

        logger.info(f"Histórico Binance: {len(df)} registros")
        return df

    except Exception as e:
        logger.error(f"Error obteniendo datos históricos: {e}")
        raise

def create_prediction_sequence(df, seq_len=168, scaler=None):
    """Prepara la última secuencia para predicción usando el mismo scaler del entrenamiento."""
    if len(df) < seq_len:
        raise ValueError(f"Datos insuficientes: {len(df)} < {seq_len}")

    data = df[['price', 'volume', 'returns', 'log_returns']].values

    if scaler is None:
        raise ValueError("Se requiere un scaler para la predicción")

    data_scaled = scaler.transform(data)
    last_sequence = data_scaled[-seq_len:]
    sequence_tensor = torch.tensor(last_sequence, dtype=torch.float32).unsqueeze(0)

    return sequence_tensor

def predict_next_price(model=None, scaler=None):
    """Predice el próximo precio de ETH basado en los datos históricos."""
    if model is None or scaler is None:
        logger.info("Cargando modelo (si no se pasó como argumento)...")
        loaded_model, loaded_scaler = load_model()
    else:
        logger.info("Usando modelo y scaler pre-cargados.")
        loaded_model = model
        loaded_scaler = scaler

    seq_len = 168

    logger.info("Obteniendo datos históricos...")
    df = get_eth_historical_data(hours=seq_len + 10)

    if len(df) < seq_len:
        raise ValueError(f"Datos insuficientes: {len(df)} < {seq_len}")

    logger.info("Preparando secuencia para predicción...")
    X = create_prediction_sequence(df, seq_len, scaler=loaded_scaler)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Usando dispositivo: {device}")

    loaded_model.to(device)
    X = X.to(device)

    logger.info("Realizando predicción...")
    with torch.no_grad():
        pred_scaled = loaded_model(X).cpu().numpy()

    dummy_data = np.zeros((pred_scaled.shape[0], 4))
    dummy_data[:, 0] = pred_scaled.flatten()

    pred_unscaled = loaded_scaler.inverse_transform(dummy_data)
    pred_price = pred_unscaled[0, 0]

    current_price = get_current_eth_price()
    change_pct = ((pred_price - current_price) / current_price) * 100 if current_price > 0 else 0
    direction = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"

    result = {
        'predicted_price': round(float(pred_price), 2),
        'current_price': round(float(current_price), 2),
        'change_percent': round(float(change_pct), 2),
        'direction': direction,
        'timestamp': datetime.now().isoformat(),
        'model_info': {
            'sequence_length': seq_len,
            'features': ['price', 'volume', 'returns', 'log_returns']
        },
        'model_context_protocol': {
            'model_hash': MODEL_HASH,
            'model_version': MODEL_VERSION
        }
    }

    logger.info(f"Precio actual: ${current_price:.2f}")
    logger.info(f"Predicción: ${pred_price:.2f}")
    logger.info(f"Cambio esperado: {change_pct:.2f}% {direction}")

    return result

if __name__ == "__main__":
    try:
        result = predict_next_price()
        print(json.dumps(result, indent=2))
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        error_result = {
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
            'status': 'failed'
        }
        print(json.dumps(error_result, indent=2))
