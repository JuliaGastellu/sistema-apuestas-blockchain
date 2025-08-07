import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Smartphone, Monitor, Loader2 } from "lucide-react";

interface HeaderProps {
  account: string | null;
  userBalance: number;
  connectWallet: () => void;
  isLoading: boolean;
  screenSize: string;
}

export function Header({
  account,
  userBalance,
  connectWallet,
  isLoading,
  screenSize,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ETH Price Betting
          </h1>
          <p className="text-muted-foreground text-xs">
            ML Predictions & Real-time Betting
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {account ? (
          <Card className="p-2 bg-card border">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-mono truncate max-w-[100px]">
                  {account}
                </p>
                <p className="font-bold">{userBalance.toFixed(4)} ETH</p>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span className="ml-2">Connect Wallet</span>
          </Button>
        )}
      </div>
    </header>
  );
}
