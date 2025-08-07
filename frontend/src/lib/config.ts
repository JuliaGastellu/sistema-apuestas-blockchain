// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'ETH Predictor',
  version: '1.0.0',
  description: 'Predicciones ML y apuestas en tiempo real',
} as const;

// Configuración de contratos
export const CONTRACT_CONFIG = {
  BETTING_ADDRESS: "0xA70eF4B81F36305b3D9ce8AdCADe793397ce578b",
  NETWORK_ID: 11155111, // Sepolia
  NETWORK_NAME: 'Sepolia Testnet',
  BETTING_ABI: [
    "function currentRoundId() view returns (uint256)",
    "function getRoundInfo(uint256) view returns (uint256 id, uint256 targetTime, uint256 actualPrice, bool resolved, uint256 totalPool)",
    "function getRangeInfo(uint256 roundId, uint256 rangeIndex) view returns (uint256 minPrice, uint256 maxPrice, uint256 totalBets)",
    "function getUserBet(uint256 roundId, uint256 rangeIndex, address user) view returns (uint256)",
    "function placeBet(uint256 roundId, uint256 rangeIndex) payable",
    "function resolveRound(uint256 roundId) external",
    "function getWinningRange(uint256 roundId) view returns (uint256)"
  ]
} as const;

// Configuración de APIs
export const API_CONFIG = {
  ML_API_URL: "https://eth-betting-ml.onrender.com",
  BINANCE_API_URL: "https://api.binance.com/api/v3",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Configuración de rangos de precios
export const PRICE_CONFIG = {
  RANGES: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500],
  DEFAULT_PRICE: 3500,
  UPDATE_INTERVAL: 300000, // 5 minutos
} as const;

// Configuración de redes soportadas
export const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    rpcUrls: ['https://polygon-rpc.com/'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  bsc: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://bscscan.com'],
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
} as const;

// Configuración de UI
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  LOADING_TIMEOUT: 30000,
  REFRESH_INTERVAL: 30000,
  MOBILE_BREAKPOINT: 640,
  TABLET_BREAKPOINT: 1024,
} as const;

// Configuración de errores
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet no conectada',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  INVALID_AMOUNT: 'Monto inválido',
  NETWORK_ERROR: 'Error de red',
  API_ERROR: 'Error de API',
  TRANSACTION_FAILED: 'Transacción fallida',
  USER_REJECTED: 'Transacción cancelada por el usuario',
} as const; 