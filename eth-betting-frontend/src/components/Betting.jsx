import React from 'react';
import BettingPanel from './BettingPanel';
import BettingRanges from './BettingRanges';
import RecentBets from './RecentBets';

const Betting = ({ roundData, rangesData, onPlaceBet }) => (
  <>
    <BettingPanel rangesData={rangesData} onPlaceBet={onPlaceBet} />
    <BettingRanges rangesData={rangesData} totalPool={roundData?.totalPool} />
    <RecentBets />
  </>
);

export default Betting;
