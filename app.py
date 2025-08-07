from flask import Flask, request, jsonify, make_response
import torch
import torch.nn as nn
import numpy as np
import os
import sys
import traceback
import logging
import time
from datetime import datetime
import signal
import hashlib
import json
from functools import wraps

# === MCP: Generar hash del modelo ===
def generate_model_hash(file_path):
    with open(file_path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

model_metadata = {
    "hash": generate_model_hash("ml/eth_price_model.pth"),
    "version": "v1.0.0",
    "trained_on": "2025-07-30",
    "owner": "0x123...abc"
}

with open("model_metadata.json", "w") as f:
    json.dump(model_metadata, f)

# === Logging ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log') if not os.environ.get('RENDER') else logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# === Modelo LSTM ===
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

app = Flask(__name__)

# === Variables globales ===
model = None
scaler = None
model_loaded = False
model_info = {}
prediction_count = 0
start_time = time.time()

# === Rate limiting ===
request_times = {}
RATE_LIMIT = 100
RATE_WINDOW = 60

def rate_limit(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        current_time = time.time()

        if client_ip in request_times:
            request_times[client_ip] = [t for t in request_times[client_ip] if current_time - t < RATE_WINDOW]
        else:
            request_times[client_ip] = []

        if len(request_times[client_ip]) >= RATE_LIMIT:
            response = jsonify({"error": "Rate limit exceeded.", "success": False})
            response.status_code = 429
            return add_cors_headers(response)

        request_times[client_ip].append(current_time)
        return f(*args, **kwargs)
    return decorated

# === CORS ===
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

@app.after_request
def after_request(response):
    return add_cors_headers(response)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# === Cargar modelo ===
def load_model():
    global model, scaler, model_loaded, model_info
    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            logger.info(f"Intento {attempt + 1} de carga...")
            possible_paths = [
                "ml/eth_price_model.pth",
                "eth_price_model.pth",
                os.path.join(os.path.dirname(__file__), "ml", "eth_price_model.pth")
            ]

            checkpoint_path = next((p for p in possible_paths if os.path.exists(p)), None)
            if not checkpoint_path:
                raise FileNotFoundError("No se encontró eth_price_model.pth")

            checkpoint = torch.load(checkpoint_path, map_location=torch.device('cpu'))
            if "model_state_dict" not in checkpoint or "scaler" not in checkpoint:
                raise KeyError("Faltan claves en checkpoint")

            model = ETHPriceLSTM(4)
            model.load_state_dict(checkpoint["model_state_dict"])
            model.eval()
            scaler = checkpoint["scaler"]

            model_info.update({
                "loaded_at": datetime.now().isoformat(),
                "path": checkpoint_path,
                "parameters": sum(p.numel() for p in model.parameters()),
                "input_features": 4,
                "architecture": "LSTM + Dense",
                "scaler_type": type(scaler).__name__
            })

            model_loaded = True
            logger.info("Modelo cargado correctamente.")
            return True

        except Exception as e:
            logger.error(f"Error en intento {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)

    return False

logger.info("Cargando modelo...")
load_model()

# === Validación ===
def validate_sequence_data(sequence):
    if not isinstance(sequence, (list, np.ndarray)):
        return False, "Debe ser lista o array"
    try:
        seq_array = np.array(sequence, dtype=np.float32)
    except:
        return False, "Valores no numéricos"
    if len(seq_array.shape) != 2 or seq_array.shape[1] != 4:
        return False, "Debe ser 2D con 4 features"
    if seq_array.shape[0] < 1:
        return False, "Debe tener al menos 1 punto"
    if np.any(np.isnan(seq_array)) or np.any(np.isinf(seq_array)):
        return False, "Valores NaN/Inf"
    if np.any(seq_array < 1) or np.any(seq_array > 50000):
        return False, "Precios fuera de rango"
    return True, seq_array

# === Endpoints ===
@app.route('/')
def index():
    uptime = int(time.time() - start_time)
    return jsonify({
        "service": "ETH Price Prediction API",
        "version": "1.0.0",
        "status": "OK",
        "model_loaded": model_loaded,
        "uptime_seconds": uptime,
        "prediction_count": prediction_count,
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "info": "/info"
        }
    })

@app.route('/health')
def health():
    uptime = int(time.time() - start_time)
    return jsonify({
        "status": "healthy" if model_loaded else "degraded",
        "model_status": "loaded" if model_loaded else "not_loaded",
        "uptime_seconds": uptime,
        "prediction_count": prediction_count,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/info')
def info():
    if not model_loaded:
        return jsonify({"error": "Modelo no cargado", "success": False}), 503
    return jsonify({
        "model_info": model_info,
        "service_stats": {
            "uptime_seconds": int(time.time() - start_time),
            "prediction_count": prediction_count
        },
        "success": True
    })

@app.route('/predict', methods=['POST', 'OPTIONS'])
@rate_limit
def predict():
    global prediction_count

    if request.method == 'OPTIONS':
        return handle_preflight()

    start_time_request = time.time()
    try:
        if not model_loaded:
            return jsonify({"error": "Modelo no cargado", "success": False}), 503

        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser JSON", "success": False}), 400

        data = request.get_json()
        if not data or 'sequence' not in data:
            return jsonify({"error": "Campo 'sequence' requerido", "success": False}), 400

        valid, seq = validate_sequence_data(data['sequence'])
        if not valid:
            return jsonify({"error": f"Secuencia inválida: {seq}", "success": False}), 400

        seq_scaled = scaler.transform(seq)
        X = torch.tensor(seq_scaled, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            model.eval()
            pred = model(X).item()

        prediction_count += 1
        processing_time = time.time() - start_time_request

        return jsonify({
            "predicted_price": float(pred),
            "model_hash": model_metadata["hash"],
            "model_version": model_metadata["version"],
            "success": True,
            "metadata": {
                "sequence_length": int(seq.shape[0]),
                "processing_time_ms": round(processing_time * 1000, 2),
                "prediction_id": prediction_count,
                "timestamp": datetime.now().isoformat()
            }
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Error interno", "success": False}), 500

@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "No encontrado", "success": False}), 404

@app.errorhandler(429)
def ratelimit_handler(_):
    return jsonify({"error": "Rate limit exceeded", "success": False}), 429

# === Shutdown ===
def signal_handler(sig, frame):
    logger.info("Apagando servidor...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    logger.info(f"Servidor iniciado en puerto {port}")
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
