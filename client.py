import requests
import json
import time
import numpy as np
from datetime import datetime

class ETHPredictionClient:
    def __init__(self, base_url="https://eth-betting-ml.onrender.com"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ETH-Prediction-Client/1.0'
        })
    
    def health_check(self):
        """Verificar estado del servicio"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}
    
    def get_info(self):
        """Obtener información del modelo"""
        try:
            response = self.session.get(f"{self.base_url}/info", timeout=10)
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, response.json()
        except Exception as e:
            return False, {"error": str(e)}
    
    def predict(self, sequence_data, timeout=30):
        """Realizar predicción"""
        try:
            payload = {"sequence": sequence_data}
            response = self.session.post(
                f"{self.base_url}/predict", 
                json=payload, 
                timeout=timeout
            )
            
            if response.status_code == 200:
                return True, response.json()
            else:
                return False, response.json()
                
        except requests.exceptions.Timeout:
            return False, {"error": "Timeout - el servidor tardó demasiado en responder"}
        except Exception as e:
            return False, {"error": str(e)}
    
    def generate_sample_data(self, base_price=3000, length=10):
        """Generar datos de muestra para testing"""
        data = []
        current_price = base_price
        
        for i in range(length):
            # Variación aleatoria
            variation = np.random.normal(0, 50)
            open_price = current_price + variation
            
            # High y Low basados en Open
            high = open_price + abs(np.random.normal(0, 30))
            low = open_price - abs(np.random.normal(0, 30))
            
            # Close price
            close = open_price + np.random.normal(0, 20)
            
            data.append([
                round(open_price, 2),
                round(high, 2),
                round(max(low, 1), 2),  # Asegurar que low > 0
                round(close, 2)
            ])
            
            current_price = close
        
        return data

def main():
    # Inicializar cliente
    client = ETHPredictionClient()
    
    print("🚀 Cliente de Prueba - ETH Price Prediction API")
    print("=" * 50)
    
    # 1. Health Check
    print("\n1. Verificando estado del servicio...")
    is_healthy, health_data = client.health_check()
    
    if is_healthy:
        print("✅ Servicio funcionando correctamente")
        print(f"   Estado: {health_data.get('status', 'unknown')}")
        print(f"   Modelo: {health_data.get('model_status', 'unknown')}")
        print(f"   Uptime: {health_data.get('uptime_seconds', 0)} segundos")
    else:
        print("❌ Servicio no disponible")
        print(f"   Error: {health_data.get('error', 'Unknown error')}")
        return
    
    # 2. Información del modelo
    print("\n2. Obteniendo información del modelo...")
    has_info, info_data = client.get_info()
    
    if has_info:
        model_info = info_data.get('model_info', {})
        print("✅ Información del modelo:")
        print(f"   Parámetros: {model_info.get('parameters', 'N/A')}")
        print(f"   Features: {model_info.get('input_features', 'N/A')}")
        print(f"   Arquitectura: {model_info.get('architecture', 'N/A')}")
        print(f"   Cargado: {model_info.get('loaded_at', 'N/A')}")
    else:
        print("⚠️  No se pudo obtener información del modelo")
    
    # 3. Generar datos de prueba
    print("\n3. Generando datos de prueba...")
    sample_data = client.generate_sample_data(base_price=3200, length=8)
    print(f"✅ Generados {len(sample_data)} puntos de datos")
    print("   Muestra (primeros 3 puntos):")
    for i, point in enumerate(sample_data[:3]):
        print(f"     {i+1}. Open: ${point[0]}, High: ${point[1]}, Low: ${point[2]}, Close: ${point[3]}")
    
    # 4. Realizar predicción
    print("\n4. Realizando predicción...")
    start_time = time.time()
    
    success, result = client.predict(sample_data)
    
    end_time = time.time()
    request_time = (end_time - start_time) * 1000  # en ms
    
    if success:
        print("✅ Predicción exitosa!")
        print(f"   Precio predicho: ${result['predicted_price']:.2f}")
        print(f"   Tiempo de request: {request_time:.1f}ms")
        
        metadata = result.get('metadata', {})
        if metadata:
            print(f"   Tiempo de procesamiento: {metadata.get('processing_time_ms', 'N/A')}ms")
            print(f"   Secuencia procesada: {metadata.get('sequence_length', 'N/A')} puntos")
            print(f"   ID predicción: {metadata.get('prediction_id', 'N/A')}")
    else:
        print("❌ Error en predicción:")
        print(f"   {result.get('error', 'Unknown error')}")
    
    # 5. Prueba de múltiples predicciones
    print("\n5. Probando múltiples predicciones...")
    predictions = []
    
    for i in range(3):
        test_data = client.generate_sample_data(base_price=3000 + i*100, length=5)
        success, result = client.predict(test_data)
        
        if success:
            price = result['predicted_price']
            predictions.append(price)
            print(f"   Predicción {i+1}: ${price:.2f}")
        else:
            print(f"   Predicción {i+1}: Error - {result.get('error', 'Unknown')}")
    
    if predictions:
        avg_price = sum(predictions) / len(predictions)
        print(f"   Precio promedio: ${avg_price:.2f}")
        print(f"   Rango: ${min(predictions):.2f} - ${max(predictions):.2f}")
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas")

if __name__ == "__main__":
    main()