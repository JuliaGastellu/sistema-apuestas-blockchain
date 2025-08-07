// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBettingContract {
    function resolveRound(uint256 roundId, uint256 actualPrice) external;
}

contract PriceOracle {
    address public owner;
    IBettingContract public bettingContract;
    
    struct PriceUpdate {
        uint256 price;
        uint256 timestamp;
        uint256 roundId;
    }
    
    mapping(uint256 => PriceUpdate) public priceUpdates;
    uint256 public updateCount;
    
    event PriceUpdated(uint256 roundId, uint256 price, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function setBettingContract(address _bettingContract) external onlyOwner {
        bettingContract = IBettingContract(_bettingContract);
    }
    
    function updatePrice(uint256 roundId, uint256 price) external onlyOwner {
        require(address(bettingContract) != address(0), "Contrato no configurado");
        
        updateCount++;
        priceUpdates[updateCount] = PriceUpdate({
            price: price,
            timestamp: block.timestamp,
            roundId: roundId
        });
        
        bettingContract.resolveRound(roundId, price);
        emit PriceUpdated(roundId, price, block.timestamp);
    }
    
    function getLatestPrice() external view returns (uint256 price, uint256 timestamp) {
        if(updateCount > 0) {
            PriceUpdate storage latest = priceUpdates[updateCount];
            return (latest.price, latest.timestamp);
        }
        return (0, 0);
    }
}