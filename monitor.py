# Script de monitoreo
import requests
import time
import json
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class APIMonitor:
    def __init__(self, api_url, check_interval=300):  # 5 minutos
        self.api_url = api_url.rstrip('/')
        self.check_interval = check_interval
        self.alerts_sent = {}
        
    def check_health(self):
        """Verificar salud de la API"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'status': 'healthy',
                    'response_time': response.elapsed.total_seconds(),
                    'data': data
                }
            else:
                return {
                    'status': 'unhealthy',
                    'status_code': response.status_code,
                    'response_time': response.elapsed.total_seconds()
                }
                
        except requests.exceptions.Timeout:
            return {'status': 'timeout', 'error': 'Request timeout'}
        except requests.exceptions.ConnectionError:
            return {'status': 'connection_error', 'error': 'Connection failed'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def test_prediction(self):
        """Probar funcionalidad de predicción"""
        try:
            # Datos de prueba
            test_data = [
                [3000, 3050, 2980, 3020],
                [3020, 3070, 3000, 3040],
                [3040, 3090, 3020, 3060]
            ]
            
            response = requests.post(
                f"{self.api_url}/predict",
                json={"sequence": test_data},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return {
                        'status': 'success',
                        'predicted_price': result.get('predicted_price'),
                        'response_time': response.elapsed.total_seconds()
                    }
                else:
                    return {'status': 'failed', 'error': result.get('error')}
            else:
                return {'status': 'http_error', 'status_code': response.status_code}
                
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def log_status(self, health_check, prediction_test):
        """Registrar estado en log"""
        timestamp = datetime.now().isoformat()
        
        log_entry = {
            'timestamp': timestamp,
            'health_check': health_check,
            'prediction_test': prediction_test
        }
        
        # Escribir a archivo de