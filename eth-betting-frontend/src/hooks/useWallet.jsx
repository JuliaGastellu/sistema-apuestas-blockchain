import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') {
            setError('MetaMask no está instalado.');
            return;
        }

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            const accounts = await browserProvider.send('eth_requestAccounts', []);
            const currentAccount = accounts[0];
            setAccount(currentAccount);

            const currentSigner = await browserProvider.getSigner();
            setSigner(currentSigner);

            const balanceWei = await browserProvider.getBalance(currentAccount);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(balanceEth);

            setError(null);

        } catch (err) {
            console.error(err);
            setError('Fallo al conectar la billetera. Por favor, inténtalo de nuevo.');
            setAccount(null);
            setBalance(null);
            setSigner(null);
        }
    }, []);

    const disconnectWallet = () => {
        setAccount(null);
        setBalance(null);
        setProvider(null);
        setSigner(null);
        setError(null);
    };

    // Effect to handle account changes in MetaMask
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    // Re-connect with the new account
                    connectWallet();
                } else {
                    // User disconnected
                    disconnectWallet();
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [connectWallet]);

    return { account, balance, provider, signer, error, connectWallet, disconnectWallet };
};

export default useWallet;
