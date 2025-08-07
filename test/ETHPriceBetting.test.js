const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ETH Price Betting System", function () {
    let oracle, betting, owner, user1, user2;
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy Oracle
        const PriceOracle = await ethers.getContractFactory("PriceOracle");
        oracle = await PriceOracle.deploy();
        await oracle.deployed();
        
        // Deploy Betting
        const ETHPriceBetting = await ethers.getContractFactory("ETHPriceBetting");
        betting = await ETHPriceBetting.deploy(oracle.address);
        await betting.deployed();
        
        // Configure Oracle
        await oracle.setBettingContract(betting.address);
    });
    
    describe("Deployment", function () {
        it("Should set the right oracle", async function () {
            expect(await betting.oracle()).to.equal(oracle.address);
        });
        
        it("Should initialize first round", async function () {
            expect(await betting.currentRoundId()).to.equal(1);
        });
    });
    
    describe("Betting", function () {
        it("Should allow placing bets", async function () {
            const roundId = await betting.currentRoundId();
            const betAmount = ethers.utils.parseEther("0.1");
            
            await expect(
                betting.connect(user1).placeBet(roundId, 0, { value: betAmount })
            ).to.emit(betting, "BetPlaced");
        });
        
        it("Should track bet amounts correctly", async function () {
            const roundId = await betting.currentRoundId();
            const betAmount = ethers.utils.parseEther("0.1");
            
            await betting.connect(user1).placeBet(roundId, 0, { value: betAmount });
            
            const userBet = await betting.getUserBet(roundId, 0, user1.address);
            expect(userBet).to.equal(betAmount);
        });
        
        it("Should reject bets on invalid ranges", async function () {
            const roundId = await betting.currentRoundId();
            const betAmount = ethers.utils.parseEther("0.1");
            
            await expect(
                betting.connect(user1).placeBet(roundId, 999, { value: betAmount })
            ).to.be.revertedWith("Rango invalido");
        });
    });
    
    describe("Oracle Resolution", function () {
        it("Should resolve rounds correctly", async function () {
            const roundId = await betting.currentRoundId();
            const price = ethers.utils.parseEther("1750"); // $1750
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [3700]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                oracle.updatePrice(roundId, price)
            ).to.emit(betting, "RoundResolved");
        });
        
        it("Should distribute prizes to winners", async function () {
            const roundId = await betting.currentRoundId();
            const betAmount = ethers.utils.parseEther("0.1");
            
            // Place bet in range 1 ($1600-$1700)
            await betting.connect(user1).placeBet(roundId, 1, { value: betAmount });
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [3700]);
            await ethers.provider.send("evm_mine");
            
            // Set price to $1650 (in winning range)
            const winningPrice = ethers.utils.parseEther("1650");
            
            const initialBalance = await user1.getBalance();
            await oracle.updatePrice(roundId, winningPrice);
            const finalBalance = await user1.getBalance();
            
            expect(finalBalance).to.be.gt(initialBalance);
        });
    });
    
    describe("Multiple Users", function () {
        it("Should handle multiple bets in same range", async function () {
            const roundId = await betting.currentRoundId();
            const betAmount = ethers.utils.parseEther("0.1");
            
            await betting.connect(user1).placeBet(roundId, 0, { value: betAmount });
            await betting.connect(user2).placeBet(roundId, 0, { value: betAmount });
            
            const rangeInfo = await betting.getRangeInfo(roundId, 0);
            expect(rangeInfo.totalBets).to.equal(betAmount.mul(2));
        });
        
        it("Should distribute prizes proportionally", async function () {
            const roundId = await betting.currentRoundId();
            
            // User1 bets 0.1 ETH, User2 bets 0.2 ETH in same range
            await betting.connect(user1).placeBet(roundId, 1, { 
                value: ethers.utils.parseEther("0.1") 
            });
            await betting.connect(user2).placeBet(roundId, 1, { 
                value: ethers.utils.parseEther("0.2") 
            });
            
            const initialBalance1 = await user1.getBalance();
            const initialBalance2 = await user2.getBalance();
            
            // Fast forward and resolve
            await ethers.provider.send("evm_increaseTime", [3700]);
            await ethers.provider.send("evm_mine");
            
            const winningPrice = ethers.utils.parseEther("1650");
            await oracle.updatePrice(roundId, winningPrice);
            
            const finalBalance1 = await user1.getBalance();
            const finalBalance2 = await user2.getBalance();
            
            const prize1 = finalBalance1.sub(initialBalance1);
            const prize2 = finalBalance2.sub(initialBalance2);
            
            // User2 should get approximately 2x more (minus fees)
            expect(prize2).to.be.gt(prize1);
        });
    });
});