import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, DollarSign, Loader2, Play, Wallet } from "lucide-react";

interface BettingPanelProps {
  account: string | null;
  userBalance: number;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  betRangeIndex: number;
  setBetRangeIndex: (index: number) => void;
  priceRanges: string[];
  canPlaceBets: () => boolean;
  placeBet: () => void;
  isLoading: boolean;
  roundInfo: any;
  currentRoundId: number | null;
  extendRoundTime: () => void;
  createNewRound: () => void;
}

export function BettingPanel({
  account,
  userBalance,
  betAmount,
  setBetAmount,
  betRangeIndex,
  setBetRangeIndex,
  priceRanges,
  canPlaceBets,
  placeBet,
  isLoading,
  roundInfo,
  currentRoundId,
  extendRoundTime,
  createNewRound,
}: BettingPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Realizar Apuesta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canPlaceBets() && !roundInfo?.resolved && (
          <div className="mb-4 p-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                Apuestas cerradas para esta ronda
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              El tiempo de apuestas ha expirado. Puedes extender la ronda actual o crear una nueva.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={extendRoundTime}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/40"
              >
                <Clock className="h-4 w-4 mr-1" />
                Extender Ronda (+1h)
              </Button>
              <Button
                onClick={createNewRound}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                Nueva Ronda
              </Button>
            </div>
          </div>
        )}

        {!currentRoundId && (
          <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Play className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                No hay ronda activa
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Crea una nueva ronda para comenzar a apostar.
            </p>
            <Button
              onClick={createNewRound}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Crear Primera Ronda
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="range-select" className="text-lg">Price Range</Label>
              <Select value={betRangeIndex.toString()} onValueChange={(value) => setBetRangeIndex(Number(value))}>
                <SelectTrigger className="w-full text-lg py-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range} className="text-lg">
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bet-amount" className="text-lg">Bet Amount (ETH)</Label>
              <Input
                id="bet-amount"
                type="number"
                step="0.01"
                min="0"
                max={userBalance}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="e.g., 0.1"
                className="w-full text-lg py-6"
              />
              <p className="text-md text-muted-foreground mt-2">
                Available Balance: {userBalance.toFixed(4)} ETH
              </p>
            </div>
          </div>

          <Button
            onClick={placeBet}
            disabled={isLoading || !betAmount || Number(betAmount) <= 0 || !account || !canPlaceBets()}
            size="lg"
            className="w-full py-8 text-2xl"
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : !canPlaceBets() ? (
              <AlertTriangle className="h-8 w-8" />
            ) : !account ? (
              <Wallet className="h-8 w-8" />
            ) : (
              <DollarSign className="h-8 w-8" />
            )}
            <span className="ml-4">Place Bet</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
