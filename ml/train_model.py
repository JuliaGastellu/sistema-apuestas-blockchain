import torch
import torch.nn as nn
import pandas as pd
import numpy as np
import hashlib
import json
from sklearn.preprocessing import MinMaxScaler, RobustScaler
from sklearn.metrics import mean_absolute_error
from torch.utils.data import DataLoader, TensorDataset
from datetime import datetime, timedelta
import requests

# Modelo LSTM con capas densas para predecir precio ETH
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

# Descarga datos históricos de Binance de los últimos 3 años
def get_historical_data(days=1095):
    end_time = int(datetime.now().timestamp() * 1000)
    start_time = end_time - days * 24 * 60 * 60 * 1000
    url = "https://api.binance.com/api/v3/klines"
    params = {"symbol": "ETHUSDT", "interval": "1h", "startTime": start_time, "endTime": end_time, "limit": 1000}
    all_data = []
    while start_time < end_time:
        params["startTime"] = start_time
        resp = requests.get(url, params=params)
        klines = resp.json()
        if not klines:
            break
        all_data.extend(klines)
        last = klines[-1][0]
        start_time = last + 60 * 60 * 1000
    df = pd.DataFrame(all_data, columns=[
        'open_time', 'open', 'high', 'low', 'close', 'volume',
        'close_time', 'quote_asset_volume', 'number_of_trades',
        'taker_buy_base', 'taker_buy_quote', 'ignore'
    ])
    df['timestamp'] = pd.to_datetime(df['open_time'], unit='ms')
    df['price'] = df['close'].astype(float)
    df['volume'] = df['volume'].astype(float)
    df['returns'] = df['price'].pct_change().fillna(0)
    df['log_returns'] = np.log(df['price'] / df['price'].shift(1)).fillna(0)
    df = df[['timestamp', 'price', 'volume', 'returns', 'log_returns']]
    df.to_parquet('eth_historical.parquet')
    return df

# Crea las secuencias para entrenamiento supervisado
def create_sequences(df, seq_len=168):
    data = df[['price', 'volume', 'returns', 'log_returns']].values
    scaler = MinMaxScaler()
    data = scaler.fit_transform(data)
    X, y = [], []
    for i in range(len(data) - seq_len - 1):
        X.append(data[i:i+seq_len])
        y.append(data[i+seq_len][0])
    X = torch.tensor(np.array(X), dtype=torch.float32)
    y = torch.tensor(np.array(y), dtype=torch.float32).unsqueeze(1)
    return X, y, scaler

# Entrena el modelo usando mini-batches para no saturar memoria
def train_model():
    df = get_historical_data()
    X, y, scaler = create_sequences(df)
    dataset = TensorDataset(X, y)
    loader = DataLoader(dataset, batch_size=256, shuffle=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = ETHPriceLSTM(input_size=X.shape[2]).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()
    for epoch in range(30):
        losses = []
        for batch_X, batch_y in loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            out = model(batch_X)
            loss = loss_fn(out, batch_y)
            opt.zero_grad()
            loss.backward()
            opt.step()
            losses.append(loss.item())
        print(f"Epoch {epoch+1} | Loss: {np.mean(losses):.6f}")
    torch.save({
        "model_state_dict": model.state_dict(),
        "scaler": scaler
    }, "ml/eth_price_model.pth")
    print("Modelo entrenado y guardado.")

if __name__ == "__main__":
    train_model()
    
# se crea elcheckpoint
checkpoint = {
    'model_state_dict': model.state_dict(),
    'scaler': scaler
}

torch.save(checkpoint, 'ml/eth_price_model.pth')

def generate_model_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

# Después de guardar tu modelo:
torch.save(checkpoint, 'ml/eth_price_model.pth')

# Generar hash
model_hash = generate_model_hash('ml/eth_price_model.pth')

# Guardar metadata
metadata = {
    'model_hash': model_hash,
    'model_version': 'v1.0.0',
    'timestamp': datetime.now().isoformat()
}

with open('ml/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"Modelo guardado con hash: {model_hash}")
