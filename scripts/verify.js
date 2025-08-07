const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const network = hre.network.name;
    const deploymentFile = `deployments/${network}.json`;
    
    if (!fs.existsSync(deploymentFile)) {
        console.log("❌ No se encontró archivo de deployment para", network);
        return;
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    
    console.log("🔍 Verificando contratos en", network);
    
    try {
        console.log("\n📜 Verificando PriceOracle...");
        await hre.run("verify:verify", {
            address: deployment.oracle,
            constructorArguments: []
        });
        console.log("✅ PriceOracle verificado");
        
    } catch (error) {
        console.log("⚠️  Oracle ya verificado o error:", error.message);
    }
    
    try {
        console.log("\n📜 Verificando ETHPriceBetting...");
        await hre.run("verify:verify", {
            address: deployment.betting,
            constructorArguments: [deployment.oracle]
        });
        console.log("✅ ETHPriceBetting verificado");
        
    } catch (error) {
        console.log("⚠️  Betting ya verificado o error:", error.message);
    }
    
    console.log("\n🎉 Verificación completada!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});