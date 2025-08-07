import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import moment from "moment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Zap, 
  Activity,
  Settings,
  Users,
  Trophy,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Play,
  Eye,
  Smartphone,
  Monitor
} from "lucide-react";
import { useETHPrediction } from "@/hooks/useETHPrediction";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useResponsive } from "@/hooks/use-responsive";
import { useToast } from "@/hooks/use-toast";
import { weiToEth, formatPrice, getPriceRanges as getPriceRangesUtil } from "@/lib/utils";
import { CONTRACT_CONFIG, API_CONFIG, PRICE_CONFIG } from "@/lib/config";
import {
  AdminPanel,
  BettingHistory,
  BettingPanel,
  Header,
  PredictionPanel,
  RoundInfo,
  SystemStatus,
} from "@/components/eth-betting";

const { BETTING_ADDRESS, BETTING_ABI } = CONTRACT_CONFIG;
const { ML_API_URL } = API_CONFIG;
const { RANGES: PRICE_RANGES } = PRICE_CONFIG;

// Componente principal
export default function EthBetting() {
  const { toast } = useToast();
  const screenSize = useResponsive();
  const { currentAccount, currentNetwork, isConnected, connectWallet } = useMetaMask();
  const { apiStatus, prediction, checkAPIStatus, makePrediction } = useETHPrediction();
  
  // Estados principales
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [priceRanges, setPriceRanges] = useState(getPriceRangesUtil(PRICE_RANGES));
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [betRangeIndex, setBetRangeIndex] = useState(0);
  const [betAmount, setBetAmount] = useState("");
  const [rangeData, setRangeData] = useState([]);
  const [ethPrice, setEthPrice] = useState(3500);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userBets, setUserBets] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalBets: 0,
    totalPool: 0,
    activeRounds: 0,
    resolvedRounds: 0
  });

  // Inicializar datos de demo
  const initializeDemoData = useCallback(() => {
    const newRoundId = Math.floor(Math.random() * 1000) + 1;
    const newTargetTime = Math.floor(Date.now() / 1000) + 3600;
    
    const newRoundInfo = {
      id: newRoundId,
      targetTime: newTargetTime,
      actualPrice: 0,
      resolved: false,
      totalPool: BigInt(0)
    };
    
    setCurrentRoundId(newRoundId);
    setRoundInfo(newRoundInfo);
    
    const emptyRanges = priceRanges.map((range, i) => ({
      label: range,
      minPrice: PRICE_RANGES[i] * 100,
      maxPrice: PRICE_RANGES[i + 1] * 100,
      totalBets: 0,
      userBet: 0
    }));
    setRangeData(emptyRanges);
  }, [priceRanges]);

  // Cargar datos de la ronda
  const loadRoundData = useCallback(async () => {
    if (!contract && currentRoundId !== null) {
      let rangeArr = [];
      for (let i = 0; i < priceRanges.length; i++) {
        const rangeItem = {
          label: priceRanges[i],
          minPrice: PRICE_RANGES[i] * 100,
          maxPrice: PRICE_RANGES[i + 1] * 100,
          totalBets: Math.random() * 0.1,
          userBet: 0
        };
        rangeArr.push(rangeItem);
      }
      setRangeData(rangeArr);
      return;
    }

    if (!contract || currentRoundId === null) return;

    try {
      const info = await contract.getRoundInfo(currentRoundId);
      setRoundInfo({
        id: Number(info.id),
        targetTime: Number(info.targetTime),
        actualPrice: Number(info.actualPrice),
        resolved: info.resolved,
        totalPool: info.totalPool
      });

      let rangeArr = [];
      let userBetsArr = [];
      for (let i = 0; i < priceRanges.length; i++) {
        const rangeInfo = await contract.getRangeInfo(currentRoundId, i);
        let userBet = BigInt(0);
        if (userAddress) {
          userBet = await contract.getUserBet(currentRoundId, i, userAddress);
        }
        
        const rangeItem = {
          label: priceRanges[i],
          minPrice: Number(rangeInfo.minPrice),
          maxPrice: Number(rangeInfo.maxPrice),
          totalBets: weiToEth(rangeInfo.totalBets),
          userBet: weiToEth(userBet)
        };
        
        rangeArr.push(rangeItem);
        
        if (userBet > 0) {
          userBetsArr.push({
            range: priceRanges[i],
            amount: weiToEth(userBet),
            roundId: currentRoundId
          });
        }
      }
      
      setRangeData(rangeArr);
      setUserBets(userBetsArr);
      
      setAdminStats({
        totalBets: rangeArr.reduce((sum, r) => sum + r.totalBets, 0),
        totalPool: weiToEth(info.totalPool),
        activeRounds: info.resolved ? 0 : 1,
        resolvedRounds: info.resolved ? 1 : 0
      });

    } catch (e: any) {
      console.error("Error cargando info de ronda:", e);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la ronda",
        variant: "destructive"
      });
    }
  }, [contract, currentRoundId, priceRanges, userAddress]);

  // Obtener datos históricos
  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=24",
        { timeout: 10000 }
      );
      
      const formattedData = response.data.map((candle) => [
        parseFloat(candle[1]), parseFloat(candle[2]),
        parseFloat(candle[3]), parseFloat(candle[4])
      ]);
      
      setHistoricalData(formattedData);
      return formattedData;
    } catch (error: any) {
      console.warn("Error fetching historical data, using fallback:", error.message);
      const sampleData = [];
      const basePrice = ethPrice;
      for (let i = 0; i < 24; i++) {
        const variation = (Math.random() - 0.5) * 100;
        const open = basePrice + variation;
        const close = open + (Math.random() - 0.5) * 50;
        const high = Math.max(open, close) + Math.random() * 30;
        const low = Math.min(open, close) - Math.random() * 30;
        sampleData.push([open, high, low, close]);
      }
      
      setHistoricalData(sampleData);
      return sampleData;
    }
  };

  const generatePrediction = async () => {
    const data = await fetchHistoricalData();
    if (data) {
      makePrediction(data);
    }
  };

  // Realizar apuesta
  const placeBet = async () => {
    if (!contract) {
      toast({
        title: "Wallet no conectada",
        description: "Conecta tu wallet primero",
        variant: "destructive"
      });
      return;
    }
    
    if (!canPlaceBets()) {
      toast({
        title: "Apuestas cerradas",
        description: "El período de apuestas para esta ronda ha terminado",
        variant: "destructive"
      });
      return;
    }
    
    if (!betAmount || isNaN(Number(betAmount)) || Number(betAmount) <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresa un monto válido",
        variant: "destructive"
      });
      return;
    }
    if (Number(betAmount) > userBalance) {
      toast({
        title: "Saldo insuficiente",
        description: "No tienes suficiente ETH",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Corregir la llamada al contrato - placeBet solo toma 2 parámetros según el ABI
      const tx = await contract.placeBet(currentRoundId, betRangeIndex, {
        value: ethers.parseEther(betAmount)
      });
      
      await tx.wait();
      
      toast({
        title: "¡Apuesta realizada!",
        description: `Apostaste ${betAmount} ETH en el rango ${priceRanges[betRangeIndex]}`
      });
      
      loadRoundData();
      const bal = await provider.getBalance(userAddress);
      setUserBalance(parseFloat(ethers.formatEther(bal)));
      setBetAmount("");
      
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        toast({
          title: "Transacción cancelada",
          description: "Transacción cancelada por el usuario",
          variant: "destructive"
        });
      } else if (e.reason) {
        toast({
          title: "Error",
          description: e.reason,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error al apostar",
          description: e.message || "Error desconocido",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular tiempo restante
  const getTimeRemaining = useCallback(() => {
    if (!roundInfo) return "Cargando...";
    
    try {
      const now = moment();
      const target = moment.unix(roundInfo.targetTime);
      const diff = target.diff(now);
      
      if (diff <= 0) {
        const timePassed = Math.abs(diff);
        if (timePassed < 300000) {
          return `Período de gracia: ${moment.utc(timePassed).format("mm:ss")}`;
        }
        return "Ronda terminada";
      }
      return moment.utc(diff).format("HH:mm:ss");
    } catch (error) {
      return "Error de tiempo";
    }
  }, [roundInfo]);

  // Verificar si se pueden realizar apuestas
  const canPlaceBets = useCallback(() => {
    if (!roundInfo) return false;
    if (roundInfo.resolved) return false;
    
    try {
      const now = moment();
      const target = moment.unix(roundInfo.targetTime);
      const diff = target.diff(now);
      
      return diff > -300000;
    } catch (error) {
      return false;
    }
  }, [roundInfo]);

  // Funciones de administración
  const extendRoundTime = () => {
    if (roundInfo) {
      const newTargetTime = Math.floor(Date.now() / 1000) + 3600;
      const updatedRoundInfo = {
        ...roundInfo,
        targetTime: newTargetTime
      };
      
      setRoundInfo(updatedRoundInfo);
      
      toast({
        title: "✅ Ronda extendida",
        description: "La ronda ha sido extendida por 1 hora más",
      });
    }
  };

  const createNewRound = () => {
    const newRoundId = (currentRoundId || 0) + 1;
    const newTargetTime = Math.floor(Date.now() / 1000) + 3600;
    
    const newRoundInfo = {
      id: newRoundId,
      targetTime: newTargetTime,
      actualPrice: 0,
      resolved: false,
      totalPool: BigInt(0)
    };
    
    setCurrentRoundId(newRoundId);
    setRoundInfo(newRoundInfo);
    
    const emptyRanges = priceRanges.map((range, i) => ({
      label: range,
      minPrice: PRICE_RANGES[i] * 100,
      maxPrice: PRICE_RANGES[i + 1] * 100,
      totalBets: 0,
      userBet: 0
    }));
    
    setRangeData(emptyRanges);
    setUserBets([]);
    
    setAdminStats({
      totalBets: 0,
      totalPool: 0,
      activeRounds: 1,
      resolvedRounds: 0
    });
    
    toast({
      title: "🎉 Nueva ronda creada",
      description: `Ronda #${newRoundId} iniciada. Duración: 1 hora`,
    });
  };

  // Efectos de inicialización
  useEffect(() => {
    if (isConnected && currentAccount) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      prov.getSigner().then(setSigner);
      setUserAddress(currentAccount.address);
      setUserBalance(parseFloat(currentAccount.balance || "0"));
    } else {
      setProvider(null);
      setSigner(null);
      setContract(null);
    }
  }, [isConnected, currentAccount]);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(BETTING_ADDRESS, BETTING_ABI, signer);
      setContract(contract);
    }
  }, [signer]);

  useEffect(() => {
    if (!contract && currentRoundId === null) {
      const timer = setTimeout(() => {
        initializeDemoData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [contract, currentRoundId, initializeDemoData]);

  useEffect(() => {
    if (currentRoundId !== null) {
      loadRoundData();
    }
  }, [loadRoundData, currentRoundId]);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT", {
          timeout: 10000
        });
        setEthPrice(parseFloat(res.data.price));
      } catch (error: any) {
        console.warn("Error fetching ETH price, using fallback:", error.message);
        setEthPrice(3500);
      }
    }
    fetchPrice();
    fetchHistoricalData();
    
    const interval = setInterval(() => {
      fetchPrice();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (roundInfo && !roundInfo.resolved) {
        // Trigger re-render for time updates
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [roundInfo]);

  const isAdmin = false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        account={currentAccount?.address || null}
        userBalance={userBalance}
        connectWallet={connectWallet}
        isLoading={isLoading}
        screenSize={screenSize}
      />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bet">Apostar</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-1 space-y-8">
                <SystemStatus
                  ethPrice={ethPrice}
                  account={currentAccount?.address || null}
                  apiStatus={apiStatus.connected ? 'online' : 'offline'}
                  historicalData={historicalData}
                />
              </div>
              <div className="lg:col-span-2">
                <PredictionPanel
                  apiStatus={apiStatus.connected ? 'online' : 'offline'}
                  prediction={prediction.result}
                  predictionLoading={prediction.loading}
                  fetchHistoricalData={fetchHistoricalData}
                  generatePrediction={generatePrediction}
                  historicalData={historicalData}
                  screenSize={screenSize}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="bet">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <RoundInfo
                currentRoundId={currentRoundId}
                roundInfo={roundInfo}
                canPlaceBets={canPlaceBets}
                getTimeRemaining={getTimeRemaining}
              />
              <BettingPanel
                account={currentAccount?.address || null}
                userBalance={userBalance}
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                betRangeIndex={betRangeIndex}
                setBetRangeIndex={setBetRangeIndex}
                priceRanges={priceRanges}
                canPlaceBets={canPlaceBets}
                placeBet={placeBet}
                isLoading={isLoading}
                roundInfo={roundInfo}
                currentRoundId={currentRoundId}
                extendRoundTime={extendRoundTime}
                createNewRound={createNewRound}
              />
            </div>
          </TabsContent>
          <TabsContent value="history">
            <BettingHistory userBets={userBets} setActiveTab={setActiveTab} />
          </TabsContent>
        </Tabs>
        {isAdmin && (
          <div className="mt-8">
            <AdminPanel
              adminStats={adminStats}
              currentRoundId={currentRoundId}
              canPlaceBets={canPlaceBets}
              getTimeRemaining={getTimeRemaining}
              extendRoundTime={extendRoundTime}
              createNewRound={createNewRound}
              roundInfo={roundInfo}
              apiStatus={apiStatus}
              ethPrice={ethPrice}
              historicalData={historicalData}
              account={currentAccount?.address || null}
            />
          </div>
        )}
      </main>
    </div>
  );
}