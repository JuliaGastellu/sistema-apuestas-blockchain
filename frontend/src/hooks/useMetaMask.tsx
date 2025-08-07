import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface MetaMaskAccount {
  address: string;
  balance?: string;
}

interface MetaMaskNetwork {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

interface MetaMaskContextType {
  isConnected: boolean;
  isConnecting: boolean;
  currentAccount: MetaMaskAccount | null;
  accounts: MetaMaskAccount[];
  currentNetwork: MetaMaskNetwork | null;
  isMetaMaskInstalled: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (account: string) => Promise<void>;
  switchNetwork: (network: MetaMaskNetwork) => Promise<void>;
  addNetwork: (network: MetaMaskNetwork) => Promise<void>;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

// Redes comunes predefinidas
export const COMMON_NETWORKS: Record<string, MetaMaskNetwork> = {
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
};

interface MetaMaskProviderProps {
  children: ReactNode;
}

export const MetaMaskProvider: React.FC<MetaMaskProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<MetaMaskAccount | null>(null);
  const [accounts, setAccounts] = useState<MetaMaskAccount[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<MetaMaskNetwork | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Verificar si MetaMask está instalado
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsMetaMaskInstalled(true);
        return true;
      }
      setIsMetaMaskInstalled(false);
      return false;
    };

    checkMetaMask();
  }, []);

  // Formatear dirección para mostrar
  const formatAddress = useCallback((address: string): string => {
    if (!address || address.length < 10) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Obtener balance de una cuenta
  const getBalance = useCallback(async (address: string): Promise<string> => {
    try {
      if (!window.ethereum) return '0';
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }, []);

  // Obtener información de la red actual
  const getCurrentNetwork = useCallback(async (): Promise<MetaMaskNetwork | null> => {
    try {
      if (!window.ethereum) return null;
      
      const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Buscar en redes comunes
      const network = Object.values(COMMON_NETWORKS).find(net => net.chainId === chainId);
      if (network) return network;

      // Si no es una red común, crear objeto básico
      return {
        chainId,
        chainName: `Network ${chainId}`,
        rpcUrls: [],
        nativeCurrency: {
          name: 'Unknown',
          symbol: 'Unknown',
          decimals: 18,
        },
      };
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }, []);

  // Conectar wallet
  const connectWallet = useCallback(async (): Promise<void> => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask no encontrado",
        description: "Por favor instala MetaMask para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accountsResponse: string[] = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (accountsResponse && accountsResponse.length > 0) {
        const accountsWithBalance = await Promise.all(
          accountsResponse.map(async (address: string) => ({
            address,
            balance: await getBalance(address),
          }))
        );

        setAccounts(accountsWithBalance);
        setCurrentAccount(accountsWithBalance[0]);
        setIsConnected(true);

        const network = await getCurrentNetwork();
        setCurrentNetwork(network);

        toast({
          title: "Wallet conectada",
          description: `Conectado a ${formatAddress(accountsResponse[0])}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo conectar la wallet";
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Desconectar wallet
  const disconnectWallet = useCallback((): void => {
    setIsConnected(false);
    setCurrentAccount(null);
    setAccounts([]);
    setCurrentNetwork(null);
    
    toast({
      title: "Wallet desconectada",
      description: "Has desconectado tu wallet exitosamente",
    });
  }, []);

  // Cambiar cuenta
  const switchAccount = useCallback(async (accountAddress: string): Promise<void> => {
    try {
      const account = accounts.find(acc => acc.address === accountAddress);
      if (account) {
        setCurrentAccount(account);
        toast({
          title: "Cuenta cambiada",
          description: `Cambiado a ${formatAddress(accountAddress)}`,
        });
      }
    } catch (error) {
      console.error('Error switching account:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la cuenta",
        variant: "destructive",
      });
    }
  }, [accounts, toast, formatAddress]);

  // Cambiar red
  const switchNetwork = useCallback(async (network: MetaMaskNetwork): Promise<void> => {
    try {
      if (!window.ethereum) return;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });

      setCurrentNetwork(network);
      toast({
        title: "Red cambiada",
        description: `Cambiado a ${network.chainName}`,
      });
    } catch (error) {
      // Si la red no está agregada, intentar agregarla
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4902) {
        await addNetwork(network);
      } else {
        console.error('Error switching network:', error);
        toast({
          title: "Error",
          description: "No se pudo cambiar la red",
          variant: "destructive",
        });
      }
    }
  }, [addNetwork, toast]);

  // Agregar nueva red (definir primero)
  const addNetwork = useCallback(async (network: MetaMaskNetwork): Promise<void> => {
    try {
      if (!window.ethereum) return;

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [network],
      });

      setCurrentNetwork(network);
      toast({
        title: "Red agregada",
        description: `${network.chainName} ha sido agregada y seleccionada`,
      });
    } catch (error) {
      console.error('Error adding network:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la red",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Escuchar cambios de cuenta y red
  useEffect(() => {
    if (!window.ethereum || !isMetaMaskInstalled) return;

    const handleAccountsChanged = async (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        disconnectWallet();
      } else if (isConnected) {
        const accountsWithBalance = await Promise.all(
          newAccounts.map(async (address: string) => ({
            address,
            balance: await getBalance(address),
          }))
        );
        setAccounts(accountsWithBalance);
        setCurrentAccount(accountsWithBalance[0]);
      }
    };

    const handleChainChanged = async (chainId: string) => {
      const network = await getCurrentNetwork();
      setCurrentNetwork(network);
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Agregar event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      // Remover event listeners de forma segura
      if (window.ethereum?.removeListener) {
        try {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        } catch (error) {
          console.warn('Error removing MetaMask listeners:', error);
        }
      }
    };
  }, [isMetaMaskInstalled, isConnected, disconnectWallet, getBalance, getCurrentNetwork]);

  const value: MetaMaskContextType = {
    isConnected,
    isConnecting,
    currentAccount,
    accounts,
    currentNetwork,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchAccount,
    switchNetwork,
    addNetwork,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = (): MetaMaskContextType => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

// Declaración de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}