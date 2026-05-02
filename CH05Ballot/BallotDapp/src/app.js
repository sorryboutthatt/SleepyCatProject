import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SCC_ADDRESS, NFT_ADDRESS, VAULT_ADDRESS, SCC_ABI, NFT_ABI, VAULT_ABI } from "./Constants";

function App() {
  const [account, setAccount] = useState("");
  const [sccBalance, setSccBalance] = useState("0");
  const [vaultShares, setVaultShares] = useState("0");
  const [hasNFT, setHasNFT] = useState(false);

  // Connect MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Fetch all balances
  const fetchBalances = async () => {
    if (!account || !window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Create contract instances
    const sccContract = new ethers.Contract(SCC_ADDRESS, SCC_ABI, provider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

    try {
      // 1. Get SleepyCatCoin Balance
      const coinBal = await sccContract.balanceOf(account);
      setSccBalance(ethers.formatUnits(coinBal, 0)); // Adjust decimals if you used 18

      // 2. Get Vault Shares
      const shares = await vaultContract.sharesOf(account);
      setVaultShares(shares.toString());

      // 3. Check for Governance NFT (using vault's boolean)
      const membershipStatus = await vaultContract.hasMembership(account);
      setHasNFT(membershipStatus);
      
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  // Refresh balances whenever the account changes
  useEffect(() => {
    fetchBalances();
  }, [account]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SleepyCat DeFi Vault</h1>
      
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p><strong>Connected:</strong> {account}</p>
          <hr />
          <h3>Your Dashboard</h3>
          <ul>
            <li><strong>SleepyCatCoin (SCC) Balance:</strong> {sccBalance}</li>
            <li><strong>Vault Shares:</strong> {vaultShares}</li>
            <li><strong>Governance NFT Status:</strong> {hasNFT ? "✅ Active Member" : "❌ No Membership"}</li>
          </ul>
          <hr />
          {/* We will add Deposit and Withdraw buttons here next! */}
        </div>
      )}
    </div>
  );
}

export default App; 