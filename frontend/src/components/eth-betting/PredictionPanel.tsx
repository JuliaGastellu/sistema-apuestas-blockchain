import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PredictionPanelProps {
  apiStatus: string;
  prediction: any;
  predictionLoading: boolean;
  fetchHistoricalData: () => void;
  generatePrediction: () => void;
  historicalData: any[];
  screenSize: string;
}

export function PredictionPanel({
  apiStatus,
  prediction,
  predictionLoading,
  fetchHistoricalData,
  generatePrediction,
  historicalData,
  screenSize,
}: PredictionPanelProps) {
  const chartData = historicalData.map((d, i) => ({
    name: i,
    price: d[3],
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ML Prediction</CardTitle>
        <CardDescription>
          {apiStatus === 'online' ? 'Connected to AI model' : 'Demo mode - API not available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <Button onClick={fetchHistoricalData} disabled={predictionLoading} variant="outline">
            <RefreshCw className="h-5 w-5 mr-2" />
            Update Data
          </Button>
          <Button onClick={generatePrediction} disabled={predictionLoading}>
            <Zap className="h-5 w-5 mr-2" />
            {predictionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Prediction"}
          </Button>
        </div>
        {prediction && (
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">${prediction.current_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Predicted Price</p>
                <p className="text-2xl font-bold">${prediction.predicted_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Change</p>
                <p className={`text-2xl font-bold ${prediction.change_percent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {prediction.change_percent.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        )}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" name="ETH Price" stroke="#8B5CF6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
