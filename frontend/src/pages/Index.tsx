import EthBetting from "./EthBetting";
import { WalletConnector } from "@/components/WalletConnector";
import { useMetaMask } from "@/hooks/useMetaMask";
const Index = () => {
  const { isConnected } = useMetaMask();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        {isConnected ? (
          <EthBetting />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg border p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🦊</span>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">
                Conecta tu Wallet
              </h3>
              <p className="text-muted-foreground mb-6">
                Para comenzar a hacer predicciones y apuestas, necesitas conectar tu wallet MetaMask
              </p>
              <WalletConnector />
              <div className="text-sm text-muted-foreground mt-6 space-y-1">
                <p>🔒 Conexión segura</p>
                <p>⚡ Transacciones rápidas</p>
                <p>📊 Predicciones precisas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;