import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SCC_ADDRESS, NFT_ADDRESS, VAULT_ADDRESS, SCC_ABI, NFT_ABI, VAULT_ABI } from "./Constants";

function App() {
  const [account, setAccount] = useState("");
  const [sccBalance, setSccBalance] = useState("0");
  const [vaultShares, setVaultShares] = useState("0");
  const [hasNFT, setHasNFT] = useState(false);
  const [amount, setAmount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    }
  };

  const fetchBalances = async () => {
    if (!account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const scc = new ethers.Contract(SCC_ADDRESS, SCC_ABI, provider);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
    
    setSccBalance((await scc.balanceOf(account)).toString());
    setVaultShares((await vault.sharesOf(account)).toString());
    setHasNFT(await vault.hasMembership(account));
  };

  const handleDeposit = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const scc = new ethers.Contract(SCC_ADDRESS, SCC_ABI, signer);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

    try {
      console.log("Approving...");
      const approveTx = await scc.approve(VAULT_ADDRESS, amount);
      await approveTx.wait();
      
      console.log("Depositing...");
      const depositTx = await vault.deposit(amount);
      await depositTx.wait();
      
      fetchBalances();
      alert("Deposit Successful! NFT Minted.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

    try {
      const tx = await vault.withdraw(amount);
      await tx.wait();
      fetchBalances();
      alert("Withdraw Successful!");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBalances(); }, [account]);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>SleepyCat DeFi Vault</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p><strong>Account:</strong> {account}</p>
          <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "10px" }}>
            <h3>Dashboard</h3>
            <p>SCC Balance: {sccBalance}</p>
            <p>Vault Shares: {vaultShares}</p>
            <p>Membership: {hasNFT ? "✅ Active" : "❌ None"}</p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <input 
              type="number" 
              placeholder="Amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              style={{ padding: "10px", marginRight: "10px" }}
            />
            <button onClick={handleDeposit} style={{ background: "green", color: "white", padding: "10px" }}>Deposit</button>
            <button onClick={handleWithdraw} style={{ background: "red", color: "white", padding: "10px", marginLeft: "5px" }}>Withdraw</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
