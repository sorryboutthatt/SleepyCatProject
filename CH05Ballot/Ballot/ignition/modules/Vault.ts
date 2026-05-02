import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VaultModule", (m) => {
  // 1. Deploy Coin with an initial supply of 1,000,000 tokens
  // We pass the argument inside the brackets []
  const coin = m.contract("SleepyCatCoin", [1000000]);

  // 2. Deploy NFT (This one usually doesn't need constructor args based on your previous files)
  const nft = m.contract("SleepyCatCoinNFT");

  // 3. Deploy Vault (passing the contract instances of Coin and NFT)
  const vault = m.contract("SleepyCatVault", [coin, nft]);

  return { coin, nft, vault };
});