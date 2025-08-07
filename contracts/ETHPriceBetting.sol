// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ETHPriceBetting {
    struct PriceRange {
        uint256 minPrice;
        uint256 maxPrice;
        uint256 totalBets;
        address[] bettors;
        mapping(address => uint256) betAmounts;
    }
    
    struct BettingRound {
        uint256 id;
        uint256 targetTime;
        uint256 actualPrice;
        bool resolved;
        uint256 totalPool;
        mapping(uint256 => PriceRange) ranges;
        uint256 rangeCount;
    }
    
    mapping(uint256 => BettingRound) public rounds;
    uint256 public currentRoundId;
    address public oracle;
    address public owner;
    
    uint256[] public priceRanges = [
        1500e18, 1600e18, 1700e18, 1800e18, 1900e18, 
        2000e18, 2100e18, 2200e18, 2300e18, 2400e18, 2500e18
    ];
    
    event BetPlaced(uint256 roundId, address bettor, uint256 rangeIndex, uint256 amount);
    event RoundResolved(uint256 roundId, uint256 actualPrice, uint256 winningRange);
    event PrizeDistributed(uint256 roundId, address winner, uint256 amount);
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Solo el oraculo puede llamar");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede llamar");
        _;
    }
    
    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
        currentRoundId = 1;
        _initializeRound(currentRoundId, block.timestamp + 3600);
    }
    
    function _initializeRound(uint256 roundId, uint256 targetTime) internal {
        BettingRound storage round = rounds[roundId];
        round.id = roundId;
        round.targetTime = targetTime;
        round.resolved = false;
        round.rangeCount = priceRanges.length - 1;
        
        for(uint256 i = 0; i < priceRanges.length - 1; i++) {
            round.ranges[i].minPrice = priceRanges[i];
            round.ranges[i].maxPrice = priceRanges[i + 1];
        }
    }
    
    function placeBet(uint256 roundId, uint256 rangeIndex) external payable {
        require(msg.value > 0, "Debe apostar algo");
        require(roundId == currentRoundId, "Ronda no activa");
        require(!rounds[roundId].resolved, "Ronda ya resuelta");
        require(block.timestamp < rounds[roundId].targetTime, "Tiempo agotado");
        require(rangeIndex < rounds[roundId].rangeCount, "Rango invalido");
        
        BettingRound storage round = rounds[roundId];
        PriceRange storage range = round.ranges[rangeIndex];
        
        if(range.betAmounts[msg.sender] == 0) {
            range.bettors.push(msg.sender);
        }
        
        range.betAmounts[msg.sender] += msg.value;
        range.totalBets += msg.value;
        round.totalPool += msg.value;
        
        emit BetPlaced(roundId, msg.sender, rangeIndex, msg.value);
    }
    
    function resolveRound(uint256 roundId, uint256 actualPrice) external onlyOracle {
        require(!rounds[roundId].resolved, "Ya resuelta");
        require(block.timestamp >= rounds[roundId].targetTime, "Aun no es tiempo");
        
        BettingRound storage round = rounds[roundId];
        round.actualPrice = actualPrice;
        round.resolved = true;
        
        uint256 winningRange = _findWinningRange(roundId, actualPrice);
        emit RoundResolved(roundId, actualPrice, winningRange);
        
        _distributePrizes(roundId, winningRange);
        _startNewRound();
    }
    
    function _findWinningRange(uint256 roundId, uint256 price) internal view returns (uint256) {
        BettingRound storage round = rounds[roundId];
        
        for(uint256 i = 0; i < round.rangeCount; i++) {
            if(price >= round.ranges[i].minPrice && price < round.ranges[i].maxPrice) {
                return i;
            }
        }
        return round.rangeCount; // Fuera de rango
    }
    
    function _distributePrizes(uint256 roundId, uint256 winningRange) internal {
        BettingRound storage round = rounds[roundId];
        
        if(winningRange >= round.rangeCount) return;
        
        PriceRange storage winningPriceRange = round.ranges[winningRange];
        if(winningPriceRange.totalBets == 0) return;
        
        uint256 totalPrize = round.totalPool;
        uint256 ownerFee = totalPrize * 5 / 100; // 5% fee
        uint256 prizesPool = totalPrize - ownerFee;
        
        payable(owner).transfer(ownerFee);
        
        for(uint256 i = 0; i < winningPriceRange.bettors.length; i++) {
            address bettor = winningPriceRange.bettors[i];
            uint256 betAmount = winningPriceRange.betAmounts[bettor];
            uint256 prize = (prizesPool * betAmount) / winningPriceRange.totalBets;
            
            payable(bettor).transfer(prize);
            emit PrizeDistributed(roundId, bettor, prize);
        }
    }
    
    function _startNewRound() internal {
        currentRoundId++;
        _initializeRound(currentRoundId, block.timestamp + 3600);
    }
    
    function getRoundInfo(uint256 roundId) external view returns (
        uint256 id, uint256 targetTime, uint256 actualPrice, 
        bool resolved, uint256 totalPool
    ) {
        BettingRound storage round = rounds[roundId];
        return (round.id, round.targetTime, round.actualPrice, round.resolved, round.totalPool);
    }
    
    function getRangeInfo(uint256 roundId, uint256 rangeIndex) external view returns (
        uint256 minPrice, uint256 maxPrice, uint256 totalBets
    ) {
        return (
            rounds[roundId].ranges[rangeIndex].minPrice,
            rounds[roundId].ranges[rangeIndex].maxPrice,
            rounds[roundId].ranges[rangeIndex].totalBets
        );
    }
    
    function getUserBet(uint256 roundId, uint256 rangeIndex, address user) external view returns (uint256) {
        return rounds[roundId].ranges[rangeIndex].betAmounts[user];
    }
}