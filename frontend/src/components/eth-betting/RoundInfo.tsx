import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Activity, Trophy } from "lucide-react";
import { formatPrice, weiToEth } from "@/lib/utils";

interface RoundInfoProps {
  currentRoundId: number | null;
  roundInfo: any;
  canPlaceBets: () => boolean;
  getTimeRemaining: () => string;
}

export function RoundInfo({
  currentRoundId,
  roundInfo,
  canPlaceBets,
  getTimeRemaining,
}: RoundInfoProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Round #{currentRoundId || 'Loading'}</span>
          <Badge variant={canPlaceBets() && !roundInfo?.resolved ? "default" : "destructive"}>
            {canPlaceBets() && !roundInfo?.resolved ? "Open" : "Closed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-lg">
        <div className="flex items-center">
          <Clock className="h-6 w-6 mr-2" />
          <span>{getTimeRemaining()}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          <span>{roundInfo ? weiToEth(roundInfo.totalPool).toFixed(4) : "0.0000"} ETH</span>
        </div>
        <div className="flex items-center">
          <Activity className="h-6 w-6 mr-2" />
          <Badge variant={roundInfo?.resolved ? 'default' : canPlaceBets() ? 'outline' : 'destructive'}>
            {roundInfo?.resolved ? "Resolved" : canPlaceBets() ? "Active" : "Closed"}
          </Badge>
        </div>
        {roundInfo?.resolved && roundInfo.actualPrice > 0 && (
          <div className="flex items-center">
            <Trophy className="h-6 w-6 mr-2" />
            <span>{formatPrice(roundInfo.actualPrice)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
