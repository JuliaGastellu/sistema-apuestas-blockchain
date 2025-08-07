import React from 'react';
import SystemStatus from './SystemStatus';
import CurrentRound from './CurrentRound';
import MLPrediction from './MLPrediction';
import HistoricalChart from './HistoricalChart';
import BettingRanges from './BettingRanges';
import RecentBets from './RecentBets';

const Dashboard = ({ roundData, rangesData, prediction, currentPrice, isPredictionLoading, refreshPrediction }) => (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <SystemStatus currentPrice={currentPrice} />
      <CurrentRound roundData={roundData} />
      <MLPrediction prediction={prediction} currentPrice={currentPrice} isLoading={isPredictionLoading} refreshPrediction={refreshPrediction} />
    </div>
    <HistoricalChart />
    <BettingRanges rangesData={rangesData} totalPool={roundData?.totalPool} />
    <RecentBets />
  </>
);

export default Dashboard;
