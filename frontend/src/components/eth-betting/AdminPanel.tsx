import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Activity, Users, Trophy, Settings, Play } from "lucide-react";

interface AdminStats {
  totalBets: number;
  totalPool: number;
  activeRounds: number;
  resolvedRounds: number;
}

interface AdminPanelProps {
  adminStats: AdminStats;
  currentRoundId: number | null;
  canPlaceBets: () => boolean;
  getTimeRemaining: () => string;
  extendRoundTime: () => void;
  createNewRound: () => void;
  roundInfo: any;
  apiStatus: string;
  ethPrice: number;
  historicalData: any[];
  account: string | null;
}

export function AdminPanel({
  adminStats,
  currentRoundId,
  canPlaceBets,
  getTimeRemaining,
  extendRoundTime,
  createNewRound,
  roundInfo,
  apiStatus,
  ethPrice,
  historicalData,
  account,
}: AdminPanelProps) {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Panel de Administración</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Gestión de rondas y estadísticas del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-muted">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Apostado</span>
              </div>
              <p className="text-2xl font-bold">{adminStats.totalBets.toFixed(4)} ETH</p>
            </Card>
            <Card className="p-4 bg-muted">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Pool Actual</span>
              </div>
              <p className="text-2xl font-bold">{adminStats.totalPool.toFixed(4)} ETH</p>
            </Card>
            <Card className="p-4 bg-muted">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Rondas Activas</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{adminStats.activeRounds}</p>
            </Card>
            <Card className="p-4 bg-muted">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Rondas Resueltas</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{adminStats.resolvedRounds}</p>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-muted">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Gestión de Rondas
              </h3>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Ronda actual: #{currentRoundId}</p>
                  <p>Estado: {canPlaceBets() ? 'Apuestas abiertas' : 'Apuestas cerradas'}</p>
                  <p>Tiempo restante: {getTimeRemaining()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={extendRoundTime}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={!roundInfo}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Extender Ronda Actual (+1h)
                  </Button>
                  <Button
                    onClick={createNewRound}
                    variant="default"
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Crear Nueva Ronda
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-muted">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Resolver Ronda
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Finaliza la ronda actual y distribuye las ganancias basadas en el precio real de ETH.
                </p>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={!roundInfo || roundInfo.resolved}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Resolver Ronda #{currentRoundId}
                </Button>
              </div>
            </Card>
          </div>
          <Card className="p-6 bg-muted">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Estado del Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">API ML</p>
                <Badge variant={apiStatus === 'online' ? 'default' : 'destructive'} className="mt-1">
                  {apiStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Precio ETH</p>
                <p className="font-bold">${ethPrice.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Datos históricos</p>
                <p className="font-bold">{historicalData.length} puntos</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Conexiones</p>
                <p className="font-bold">{account ? '1' : '0'} usuario{account ? '' : 's'}</p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
