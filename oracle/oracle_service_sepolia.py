import os
import sys
import time
import json
from datetime import datetime
from web3 import Web3
from dotenv import load_dotenv

# Importar módulos ML
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml.predict import predict_next_price

load_dotenv()

class SepoliaOracleService:
    def __init__(self):
        # Conectar a Sepolia
        rpc_url = os.getenv('SEPOLIA_RPC_URL')
        if not rpc_url:
            raise ValueError("SEPOLIA_RPC_URL no configurada")
        
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not self.w3.is_connected():
            raise ConnectionError("No se pudo conectar a Sepolia")
        
        print(f"✅ Conectado a Sepolia - Block: {self.w3.eth.block_number}")
        
        # Cargar configuración
        self.oracle_address = os.getenv('ORACLE_ADDRESS')
        self.betting_address = os.getenv('BETTING_ADDRESS')
        private_key = os.getenv('PRIVATE_KEY')
        
        if not all([self.oracle_address, self.betting_address, private_key]):
            raise ValueError("Faltan variables de entorno: ORACLE_ADDRESS, BETTING_ADDRESS, PRIVATE_KEY")
        
        # Configurar cuenta
        self.account = self.w3.eth.account.from_key(private_key)
        
        print(f"🔑 Usando cuenta: {self.account.address}")
        
        # Verificar balance
        balance = self.w3.eth.get_balance(self.account.address)
        balance_eth = self.w3.from_wei(balance, 'ether')
        print(f"💰 Balance: {balance_eth:.4f} ETH")
        
        if balance_eth < 0.01:
            print("⚠️  Advertencia: Balance bajo, necesitás más ETH para las transacciones")
        
        # ABIs de contratos
        self.oracle_abi = [
            {
                "inputs": [{"name": "roundId", "type": "uint256"}, {"name": "price", "type": "uint256"}],
                "name": "updatePrice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getLatestPrice",
                "outputs": [{"name": "price", "type": "uint256"}, {"name": "timestamp", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        self.betting_abi = [
            {
                "inputs": [],
                "name": "currentRoundId",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "roundId", "type": "uint256"}],
                "name": "getRoundInfo",
                "outputs": [
                    {"name": "id", "type": "uint256"},
                    {"name": "targetTime", "type": "uint256"},
                    {"name": "actualPrice", "type": "uint256"},
                    {"name": "resolved", "type": "bool"},
                    {"name": "totalPool", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        # Conectar contratos
        self.oracle_contract = self.w3.eth.contract(
            address=self.oracle_address,
            abi=self.oracle_abi
        )
        
        self.betting_contract = self.w3.eth.contract(
            address=self.betting_address,
            abi=self.betting_abi
        )
        
        print(f"📜 Oracle: {self.oracle_address}")
        print(f"📜 Betting: {self.betting_address}")
    
    def get_gas_price(self):
        """Obtiene precio de gas dinámico"""
        try:
            gas_price = self.w3.eth.gas_price
            # Agregar 10% para asegurar inclusión
            return int(gas_price * 1.1)
        except:
            return self.w3.to_wei(10, 'gwei')  # Fallback a 10 gwei
    
    def check_rounds_to_resolve(self):
        """Verifica rondas que necesitan resolución"""
        try:
            current_round_id = self.betting_contract.functions.currentRoundId().call()
            current_time = int(time.time())
            
            print(f"🔍 Verificando ronda {current_round_id}...")
            
            # Verificar ronda actual
            round_info = self.betting_contract.functions.getRoundInfo(current_round_id).call()
            round_id, target_time, actual_price, resolved, total_pool = round_info
            
            pool_eth = self.w3.from_wei(total_pool, 'ether')
            print(f"⏰ Target: {datetime.fromtimestamp(target_time)}")
            print(f"💰 Pool: {pool_eth:.4f} ETH")
            print(f"✅ Resuelta: {resolved}")
            
            if not resolved and current_time >= target_time and total_pool > 0:
                print(f"🎯 Resolviendo ronda {current_round_id}...")
                self.resolve_round(current_round_id)
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error verificando rondas: {e}")
            return False
    
    def resolve_round(self, round_id):
        """Resuelve ronda con predicción ML"""
        try:
            print("🤖 Generando predicción ML...")
            prediction = predict_next_price()
            predicted_price = prediction['predicted_price']
            
            print(f"💡 Precio predicho: ${predicted_price:.2f}")
            
            # Convertir a wei
            price_wei = self.w3.to_wei(predicted_price, 'ether')
            
            # Preparar transacción
            gas_price = self.get_gas_price()
            
            transaction = self.oracle_contract.functions.updatePrice(
                round_id,
                price_wei
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Firmar y enviar
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"⏳ TX enviada: {tx_hash.hex()}")
            
            # Esperar confirmación
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            if receipt.status == 1:
                print(f"✅ Ronda {round_id} resuelta exitosamente!")
                print(f"⛽ Gas usado: {receipt.gasUsed:,}")
                print(f"🔗 TX: https://sepolia.etherscan.io/tx/{tx_hash.hex()}")
            else:
                print(f"❌ Transacción falló")
            
        except Exception as e:
            print(f"❌ Error resolviendo ronda {round_id}: {e}")
    
    def run_forever(self):
        """Ejecuta el oráculo continuamente"""
        print("🚀 Iniciando Oracle Service para Sepolia...")
        print("⏹️  Presiona Ctrl+C para detener")
        
        check_interval = 300  # 5 minutos
        
        while True:
            try:
                print(f"\n🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                resolved = self.check_rounds_to_resolve()
                
                if resolved:
                    print("⏳ Esperando 30s antes del próximo check...")
                    time.sleep(30)
                else:
                    print(f"😴 Esperando {check_interval}s...")
                    time.sleep(check_interval)
                    
            except KeyboardInterrupt:
                print("\n🛑 Deteniendo Oracle Service...")
                break
            except Exception as e:
                print(f"❌ Error en loop principal: {e}")
                print("🔄 Reintentando en 60s...")
                time.sleep(60)
    
    def run_once(self):
        """Ejecuta una verificación única"""
        print("🔍 Ejecutando verificación única...")
        self.check_rounds_to_resolve()

if __name__ == "__main__":
    try:
        oracle = SepoliaOracleService()
        
        if len(sys.argv) > 1 and sys.argv[1] == "--once":
            oracle.run_once()
        else:
            oracle.run_forever()
            
    except Exception as e:
        print(f"💥 Error fatal: {e}")
        sys.exit(1)