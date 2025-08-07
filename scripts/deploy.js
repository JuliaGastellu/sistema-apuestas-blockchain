const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Desplegando en", hre.network.name);
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Desplegando con la cuenta:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("💰 Balance de la cuenta:", hre.ethers.utils.formatEther(balance), "ETH");
    
    if (hre.network.name === "sepolia" && balance.lt(hre.ethers.utils.parseEther("0.1"))) {
        console.log("⚠️  Advertencia: Balance bajo para Sepolia. Necesitás al menos 0.1 ETH");
    }
    
    console.log("\n📜 Desplegando PriceOracle...");
    const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
    const oracle = await PriceOracle.deploy();
    await oracle.deployed();
    
    console.log("✅ PriceOracle desplegado en:", oracle.address);
    console.log("🔗 TX hash:", oracle.deployTransaction.hash);
    
    console.log("\n📜 Desplegando ETHPriceBetting...");
    const ETHPriceBetting = await hre.ethers.getContractFactory("ETHPriceBetting");
    const betting = await ETHPriceBetting.deploy(oracle.address);
    await betting.deployed();
    
    console.log("✅ ETHPriceBetting desplegado en:", betting.address);
    console.log("🔗 TX hash:", betting.deployTransaction.hash);
    
    console.log("\n🔧 Configurando Oracle...");
    const setBettingTx = await oracle.setBettingContract(betting.address);
    await setBettingTx.wait();
    console.log("✅ Oracle configurado");
    
    // Guardar direcciones
    const addresses = {
        network: hre.network.name,
        oracle: oracle.address,
        betting: betting.address,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };
    
    // Actualizar .env
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/ORACLE_ADDRESS=.*/, `ORACLE_ADDRESS=${oracle.address}`);
    envContent = envContent.replace(/BETTING_ADDRESS=.*/, `BETTING_ADDRESS=${betting.address}`);
    fs.writeFileSync('.env', envContent);
    
    // Guardar deployment info
    const deploymentPath = `deployments/${hre.network.name}.json`;
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(addresses, null, 2));
    
    console.log("\n🎉 Deploy completado!");
    console.log("📁 Addresses guardadas en:", deploymentPath);
    
    if (hre.network.name === "sepolia") {
        console.log("\n📋 Para verificar en Etherscan:");
        console.log(`npx hardhat verify --network sepolia ${oracle.address}`);
        console.log(`npx hardhat verify --network sepolia ${betting.address} ${oracle.address}`);
        
        console.log("\n🌐 Ver en Etherscan:");
        console.log(`Oracle: https://sepolia.etherscan.io/address/${oracle.address}`);
        console.log(`Betting: https://sepolia.etherscan.io/address/${betting.address}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });