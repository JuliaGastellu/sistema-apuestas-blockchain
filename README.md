# ETH Price Betting con Machine Learning

Sistema descentralizado para apostar en rangos de precios de Ethereum (ETH) usando predicciones basadas en inteligencia artificial. Los usuarios apuestan ETH en rangos de precios futuros, y el sistema usa contratos inteligentes para manejar apuestas y pagos automáticos, con un oráculo que conecta la blockchain con un modelo ML entrenado con datos históricos.

Este modelo de ML analiza patrones y tendencias históricas. Luego, calcula una probabilidad para la dirección futura. Esta predicción es el "dato" que el oráculo lleva a la blockchain. Sirve como fuente para resolver las apuestas. Así, puedo crear apuestas basadas en un resultado predictivo. Esto añade utilidad más allá de usar solo datos pasados.

Disclaimer: Se utilizó un modelo relativamente modesto por limitaciones de hardware. Sin embargo, este Producto Mínimo Viable (MVP) establece la base para un desarrollo futuro.

## ¿Qué hace este proyecto?

- Predicciones precisas de rangos de precio de ETH basadas en un modelo LSTM entrenado con hasta 3 años de datos históricos horarios de Binance.
- Apostás en rangos de precio (ej. $1800-$1900) y no solo en “sube o baja”.
- Los contratos inteligentes en Solidity manejan las apuestas, el pago a ganadores y la transparencia en la blockchain.
- Un oráculo en JavaScript conecta el modelo ML con los contratos, desplegado en Sepolia.
- Interfaz web interactiva con Streamlit para apostar, ver predicciones y estadísticas en tiempo real.

## Stack Tecnológico

### Blockchain & Smart Contracts
- Solidity: contratos EthPriceBetting.sol y PriceOracle.sol.
- Hardhat: desarrollo, testing y deployment.
- Scripts deploy.js e interact.js para manejo de contratos.
- Oracle oracle_service_sepolia.js para conexión blockchain-ML.

### Machine Learning & Datos
- Python con PyTorch para modelo LSTM de predicción.
- Datos históricos horarios de Binance (hasta 3 años para entrenamiento, última semana para predicción).
- Pandas y NumPy para procesamiento y normalización (MinMaxScaler).
- Características: precio cierre, volumen, retornos simples y logarítmicos.
- Secuencias temporales de 168 horas alimentan el modelo.
- Scripts: `ml/train_model.py` para entrenar, `ml/predict.py` para predecir.

### Frontend & Visualización
- App React básica para la interfaz web.
- Conexión a Metamask para poder hacer las apuestas.

### Infraestructura
- Solidity + Hardhat para scripts blockchain y oráculo.
- Git para control de versiones.

## ¿Cómo funciona?

### Usuario:
1. Ejecuta `npm run dev` dentro de la carpeta eth-betting-frontend.
2. Visualiza la predicción de precio y rangos.
3. Elige un rango para apostar y apuesta ETH.
4. Espera resolución de ronda y pago automático si gana.

### Sistema:
1. El modelo ML entrena con datos históricos de Binance (hasta 3 años).
2. Para predecir, usa la última semana de datos más algunos registros adicionales para secuencia completa.
3. El oráculo obtiene la predicción y la envía a contratos en Sepolia.
4. El contrato EthPriceBetting gestiona apuestas, ronda y pagos.
5. Todo queda registrado en la blockchain.

## Instalación rápida

```bash
git clone https://github.com/tu-usuario/eth-betting-ml
cd eth-betting-ml

# Instalar dependencias 
npm install
pip install -r requirements.txt

# Entrenar modelo ML (solo la primera vez o para actualizar)
python ml/train_model.py

# Generar predicción
python ml/predict.py

# Correr la app localmente
cd eth-betting-frontend
npm run dev
