# EthPriceBetting.sol  
Este contrato maneja un sistema de apuestas basado en rangos de precios de ETH para rondas horarias. Cada ronda define múltiples rangos consecutivos de precios, y los usuarios pueden apostar ETH en cualquiera de esos rangos antes de que la ronda expire.  

Internamente, el contrato registra las apuestas de cada usuario por rango y acumula el total apostado por rango y ronda. Al finalizar la ronda, el oráculo externo invoca `resolveRound` con el precio real. El contrato identifica el rango ganador según el precio, marca la ronda como resuelta y distribuye proporcionalmente el pool de premios entre los apostadores del rango ganador, descontando un 5% de comisión para el propietario.  

Además, el contrato soporta múltiples rondas consecutivas, inicializando automáticamente la siguiente ronda tras resolver la anterior, garantizando continuidad y transparencia.

---

# PriceOracle.sol  
Este contrato funciona como un oráculo on-chain autorizado para actualizar los precios reales que el contrato de apuestas usa para resolver las rondas. Solo el propietario puede llamar a `updatePrice`, que registra el nuevo precio asociado a una ronda y timestamp, y a la vez llama a la función `resolveRound` del contrato de apuestas para cerrar esa ronda.  

Con esta estructura, el oráculo actúa como puente confiable entre datos externos (off-chain) y la lógica on-chain, garantizando que las resoluciones de apuestas se basen en datos verificados y auditables.

---

# Integración del Oráculo con Scripts Off-Chain y Flujo General

## 1. Flujo General  
- **Recolección de datos:** Un script off-chain (por ejemplo, `oracle/oracle_service_sepolia.js`) obtiene datos de precios de Ethereum desde una API externa confiable, como Binance.  
- **Procesamiento y preparación:** El script procesa y valida los datos para asegurar calidad y formato correcto.  
- **Actualización on-chain:** El script envía una transacción al contrato `PriceOracle` llamando a `updatePrice(roundId, price)`, aportando el precio actual para una ronda específica.  
- **Resolución de apuestas:** Al recibir esta actualización, el contrato `PriceOracle` ejecuta `resolveRound` en el contrato `ETHPriceBetting`, que cierra la ronda, determina el rango ganador y distribuye las ganancias.  
- **Inicio de nueva ronda:** Internamente, el contrato de apuestas inicia automáticamente la siguiente ronda para continuar el ciclo.

## 2. Detalles del Script Off-Chain (Ejemplo)  
- **Conexión a API:** El script consulta periódicamente (cada hora) el endpoint de Binance para obtener el precio de cierre de ETH.  
- **Cálculo de roundId:** El script calcula la ronda actual según el tiempo o el último `roundId` conocido en el contrato.  
- **Firmado y envío de transacción:** Usando la clave privada autorizada, el script firma y envía la llamada `updatePrice` al contrato oráculo en la red Sepolia (o red de desarrollo).  
- **Manejo de errores y reintentos:** Se implementan mecanismos para manejar fallos en la red o en la API, asegurando la continuidad y consistencia de datos.

## 3. Seguridad y Autorización  
- Solo el propietario del contrato oráculo (dueño del script) puede enviar actualizaciones para evitar datos maliciosos.  
- La comunicación off-chain-on-chain se basa en la confianza de la clave privada que controla el oráculo.  
- En producción, se recomienda usar oráculos descentralizados (Chainlink, etc.) para mayor robustez.

## 4. Sincronización con Frontend  
El frontend (Streamlit) muestra la información en tiempo real consultando el contrato de apuestas y el oráculo para:  
- Ver rondas activas y sus rangos.  
- Mostrar precios actuales y resultados de rondas pasadas.  
- Permitir apuestas antes del cierre de cada ronda.
