import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Eye, BarChart3 } from "lucide-react";

interface SystemStatusProps {
  ethPrice: number;
  account: string | null;
  apiStatus: string;
  historicalData: any[];
}

export function SystemStatus({
  ethPrice,
  account,
  apiStatus,
  historicalData,
}: SystemStatusProps) {
  return (
    <Card className="lg:col-span-1 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Estado del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm">Precio ETH</span>
            </div>
            <span className="font-bold text-sm sm:text-xl">${ethPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Conexión</span>
            </div>
            <Badge variant={account ? 'default' : 'destructive'} className="text-xs">
              {account ? "Conectado" : "Desconectado"}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">API ML</span>
            </div>
            <Badge variant={apiStatus === 'online' ? 'default' : apiStatus === 'checking' ? 'secondary' : 'destructive'} className="text-xs">
              {apiStatus === 'online' ? '🟢 Online' : apiStatus === 'checking' ? '🟡 Check' : '🔴 Offline'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Datos</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {historicalData.length} pts
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
