const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const network = hre.network.name;
    const deploymentFile = `deployments/${network}.json`;
    
    if (!fs.existsSync(deploymentFile)) {
        console.log("❌ No se encontró deployment para", network);
        return;
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const [signer] = await hre.ethers.getSigners();
    
    console.log("🔗 Conectando a contratos en", network);
    console.log("👤 Usando cuenta:", signer.address);
    
    // Conectar a contratos
    const oracle = await hre.ethers.getContractAt("PriceOracle", deployment.oracle);
    const betting = await hre.ethers.getContractAt("ETHPriceBetting", deployment.betting);
    
    console.log("\n📊 Estado actual:");
    
    // Info del betting contract
    const currentRoundId = await betting.currentRoundId();
    console.log("🎯 Ronda actual:", currentRoundId.toString());
    
    const roundInfo = await betting.getRoundInfo(currentRoundId);
    console.log("⏰ Tiempo objetivo:", new Date(roundInfo.targetTime * 1000).toISOString());
    console.log("💰 Pool total:", hre.ethers.utils.formatEther(roundInfo.totalPool), "ETH");
    console.log("✅ Resuelta:", roundInfo.resolved);
    
    // Info del oracle
    const [latestPrice, timestamp] = await oracle.getLatestPrice();
    if (latestPrice.gt(0)) {
        console.log("🔮 Último precio del oracle:", hre.ethers.utils.formatEther(latestPrice));
        console.log("📅 Timestamp:", new Date(timestamp * 1000).toISOString());
    }
    
    // Mostrar rangos de precios
    console.log("\n📈 Rangos de precio disponibles:");
    for (let i = 0; i < 10; i++) {
        try {
            const rangeInfo = await betting.getRangeInfo(currentRoundId, i);
            const minPrice = hre.ethers.utils.formatEther(rangeInfo.minPrice);
            const maxPrice = hre.ethers.utils.formatEther(rangeInfo.maxPrice);
            const totalBets = hre.ethers.utils.formatEther(rangeInfo.totalBets);
            
            console.log(`  ${i}: $${minPrice} - $${maxPrice} (${totalBets} ETH apostado)`);
        } catch (error) {
            break;
        }
    }
    
    console.log("\n🎮 Comandos disponibles:");
    console.log("npm run interact -- --bet <rangeIndex> <amount>");
    console.log("npm run interact -- --update-price <price>");
    
    // Procesar argumentos de comando
    const args = process.argv.slice(2);
    
    if (args.includes('--bet')) {
        const rangeIndex = parseInt(args[args.indexOf('--bet') + 1]);
        const amount = args[args.indexOf('--bet') + 2];
        
        console.log(`\n🎲 Apostando ${amount} ETH en rango ${rangeIndex}...`);
        
        const tx = await betting.placeBet(currentRoundId, rangeIndex, {
            value: hre.ethers.utils.parseEther(amount)
        });
        
        console.log("⏳ TX enviada:", tx.hash);
        await tx.wait();
        console.log("✅ Apuesta confirmada!");
    }
    
    if (args.includes('--update-price')) {
        const price = args[args.indexOf('--update-price') + 1];
        const priceWei = hre.ethers.utils.parseEther(price);
        
        console.log(`\n🔮 Actualizando precio a $${price}...`);
        
        const tx = await oracle.updatePrice(currentRoundId, priceWei);
        console.log("⏳ TX enviada:", tx.hash);
        await tx.wait();
        console.log("✅ Precio actualizado!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});