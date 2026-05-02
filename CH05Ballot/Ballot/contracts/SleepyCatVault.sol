// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./SleepyCatCoin.sol"; // This is your SleepyCatCoin (FT)
import "./SleepyCatCoinNFT.sol"; // This is your SleepyCatCoinNFT (NFT)

contract SleepyCatVault {
    SleepyCatCoin public immutable asset;
    SleepyCatCoinNFT public immutable governanceNFT;
    address public admin;
    
    uint256 public totalShares;
    mapping(address => uint256) public sharesOf;
    mapping(address => bool) public hasMembership;

    uint256 public constant WITHDRAWAL_FEE_BPS = 500; // 5% Fee (10000 basis points = 100%)

    constructor(address _asset, address _nft) {
        asset = SleepyCatCoin(_asset);
        governanceNFT = SleepyCatCoinNFT(_nft);
        admin = msg.sender; // Hardcoded admin as deployer
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0"); // Add this
        uint256 shares;

        // Safety check: get balance BEFORE the transfer
        uint256 currentBalance = asset.balanceOf(address(this));

        if (totalShares == 0 || currentBalance == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalShares) / currentBalance;
        }

        asset.transferFrom(msg.sender, address(this), _amount);

        if (!hasMembership[msg.sender]) {
            governanceNFT.mintNFT(msg.sender, "ipfs://bafkreic35vg23j4myyzkozyyaqjnkptuqggqzwok6emq2b7hzkvsd7ikni");
            hasMembership[msg.sender] = true;
        }

        sharesOf[msg.sender] += shares;
        totalShares += shares;
    }

    // Task 2: Withdraw with Fees
    function withdraw(uint256 _shares) external {
        require(sharesOf[msg.sender] >= _shares, "Insufficient shares");

        // Calculate assets corresponding to these shares
        uint256 totalAssets = asset.balanceOf(address(this));
        uint256 assetsToWithdraw = (_shares * totalAssets) / totalShares;

        // Calculate 5% fee
        uint256 fee = (assetsToWithdraw * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 amountAfterFee = assetsToWithdraw - fee;

        sharesOf[msg.sender] -= _shares;
        totalShares -= _shares;

        // Task 4: Revoke membership if balance is zero
        if (sharesOf[msg.sender] == 0) {
            hasMembership[msg.sender] = false;
        }

        // Transfer fee to admin and assets to user
        asset.transfer(admin, fee);
        asset.transfer(msg.sender, amountAfterFee);
    }
}