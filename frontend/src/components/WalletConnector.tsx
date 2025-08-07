import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useMetaMask, COMMON_NETWORKS } from '@/hooks/useMetaMask';
import { Wallet, ChevronDown, Power, Users, Network, ExternalLink } from 'lucide-react';

export const WalletConnector: React.FC = () => {
  const {
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
  } = useMetaMask();

  const formatAddress = (address: string): string => {
    if (!address || address.length < 10) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card className="w-full max-w-xs shadow-md border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center py-3">
          <CardTitle className="flex items-center justify-center gap-2 text-sm text-gray-900 dark:text-white">
            <Wallet className="h-4 w-4 text-red-500" />
            MetaMask no encontrado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-3">
          <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
            Necesitas instalar MetaMask para usar esta aplicación
          </p>
          <Button 
            asChild 
            variant="outline" 
            size="sm"
            className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-medium"
            >
              Instalar MetaMask
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-xs shadow-md border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center py-3">
          <CardTitle className="flex items-center justify-center gap-2 text-sm text-gray-900 dark:text-white">
            <Wallet className="h-4 w-4 text-blue-500" />
            Conectar Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-3">
          <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
            Conecta tu wallet MetaMask para continuar
          </p>
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            size="sm"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Conectando...
              </span>
            ) : (
              'Conectar MetaMask'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xs shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="py-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-900 dark:text-white font-medium">Wallet</span>
          </span>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs px-2 py-1">
            Conectada
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        {/* Información de la cuenta actual */}
        <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cuenta:</span>
            <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border text-gray-900 dark:text-white">
              {currentAccount ? formatAddress(currentAccount.address) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Balance:</span>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {currentAccount?.balance ? `${currentAccount.balance} ETH` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Red:</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {currentNetwork?.chainName || 'Desconocida'}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-3 gap-2">
          {/* Cambiar cuenta */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-center gap-1 text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors p-2"
              >
                <Users className="h-3 w-3" />
                <ChevronDown className="h-2 w-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs font-medium">Cambiar Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.address}
                  onClick={() => switchAccount(account.address)}
                  className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="font-mono">{formatAddress(account.address)}</span>
                  {currentAccount?.address === account.address && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      Actual
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cambiar red */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-center gap-1 text-xs hover:bg-purple-50 hover:border-purple-300 transition-colors p-2"
              >
                <Network className="h-3 w-3" />
                <ChevronDown className="h-2 w-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium">Cambiar Red</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(COMMON_NETWORKS).map((network) => (
                <DropdownMenuItem
                  key={network.chainId}
                  onClick={() => switchNetwork(network)}
                  className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span>{network.chainName}</span>
                  {currentNetwork?.chainId === network.chainId && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      Actual
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desconectar */}
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors p-2"
            title="Desconectar wallet"
          >
            <Power className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};