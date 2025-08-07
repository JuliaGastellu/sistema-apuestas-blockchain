import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractInfo from '../contracts/ETHPriceBetting.json';

const useBettingContract = (provider, signer, account) => {
    const [contract, setContract] = useState(null);
    const [contractSigner, setContractSigner] = useState(null);
    const [roundId, setRoundId] = useState(null);
    const [owner, setOwner] = useState(null);
    const [roundData, setRoundData] = useState(null);
    const [rangesData, setRangesData] = useState([]);
    const [error, setError] = useState(null);

    const loadContractData = useCallback(async (currentContract) => {
        try {
            setError(null);
            const currentRoundId = await currentContract.currentRoundId();
            setRoundId(currentRoundId);

            const contractOwner = await currentContract.owner();
            setOwner(contractOwner);

            const roundInfo = await currentContract.getRoundInfo(currentRoundId);
            setRoundData({
                id: Number(roundInfo.id),
                targetTime: Number(roundInfo.targetTime),
                totalPool: ethers.formatEther(roundInfo.totalPool),
                resolved: roundInfo.resolved
            });

            // This is a fixed number from the contract, we can make it dynamic later if needed
            const rangeCount = 10;
            const ranges = [];
            for (let i = 0; i < rangeCount; i++) {
                const rangeInfo = await currentContract.getRangeInfo(currentRoundId, i);
                let userBet = '0';
                if(account) {
                    const userBetWei = await currentContract.getUserBet(currentRoundId, i, account);
                    userBet = ethers.formatEther(userBetWei);
                }

                ranges.push({
                    minPrice: ethers.formatUnits(rangeInfo.minPrice, 18),
                    maxPrice: ethers.formatUnits(rangeInfo.maxPrice, 18),
                    totalBets: ethers.formatEther(rangeInfo.totalBets),
                    userBet: userBet
                });
            }
            setRangesData(ranges);

        } catch (err) {
            console.error("Failed to load contract data:", err);
            setError("No se pudieron cargar los datos del contrato. Asegúrate de estar en la red Sepolia.");
        }
    }, [account]);

    useEffect(() => {
        if (provider) {
            const contractInstance = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
            setContract(contractInstance);
            if (signer) {
                const contractWithSigner = contractInstance.connect(signer);
                setContractSigner(contractWithSigner);
            }
            if(contractInstance) {
                loadContractData(contractInstance);
            }
        } else {
            setContract(null);
            setContractSigner(null);
        }
    }, [provider, signer, loadContractData]);


    const placeBet = async (rangeIndex, amount) => {
        if (!contractSigner) {
            throw new Error("La billetera no está conectada o no se pudo obtener el firmante.");
        }
        try {
            setError(null);
            const amountWei = ethers.parseEther(amount);
            const tx = await contractSigner.placeBet(roundId, rangeIndex, { value: amountWei });
            await tx.wait();
            loadContractData(contract);
        } catch (err) {
            console.error("Error placing bet:", err);
            let message = "Ocurrió un error al realizar la apuesta.";
            if (err.reason) {
                message = `Error del contrato: ${err.reason}`;
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                message = "Fondos insuficientes para realizar la transacción.";
            } else if (err.code === 'ACTION_REJECTED') {
                message = "Transacción rechazada por el usuario.";
            }
            setError(message);
            throw new Error(message);
        }
    };

    return { contract, contractSigner, owner, roundId, roundData, rangesData, error, placeBet, reloadData: () => loadContractData(contract) };
};

export default useBettingContract;
