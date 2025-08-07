import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";

interface Bet {
  roundId: number;
  range: string;
  amount: number;
}

interface BettingHistoryProps {
  userBets: Bet[];
  setActiveTab: (tab: string) => void;
}

export function BettingHistory({ userBets, setActiveTab }: BettingHistoryProps) {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Distribución de Apuestas por Rango</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Visualiza dónde están apostando los usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userBets && userBets.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">Ronda</th>
                    <th className="py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">Rango</th>
                    <th className="py-3 px-2 sm:px-4 text-right text-xs sm:text-sm">Monto</th>
                    <th className="py-3 px-2 sm:px-4 text-right text-xs sm:text-sm">Estado</th>
                    <th className="py-3 px-2 sm:px-4 text-right text-xs sm:text-sm">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {userBets.map((bet) => (
                    <tr key={`${bet.roundId}-${bet.range}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">#{bet.roundId}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{bet.range}</td>
                      <td className="py-3 px-2 sm:px-4 text-right font-medium text-xs sm:text-sm">{bet.amount.toFixed(4)} ETH</td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <Badge variant="secondary" className="text-xs">
                          Pendiente
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-muted-foreground text-xs sm:text-sm">
                        Por determinar
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="space-y-4">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
              <div>
                <p className="text-base sm:text-lg">No tienes apuestas registradas</p>
                <p className="text-xs sm:text-sm mt-2">Ve a la sección de apuestas para realizar tu primera apuesta</p>
              </div>
              <Button
                onClick={() => setActiveTab('bet')}
                variant="outline"
                className="mt-4"
              >
                <Play className="h-4 w-4 mr-2" />
                Ir a Apostar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
