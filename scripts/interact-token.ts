// Script untuk berinteraksi dengan token ERC20 yang dibuat
import { ethers } from "hardhat";
import { Token } from "../typechain-types";

// Alamat token ERC20 yang sudah di-deploy
// GANTI DENGAN ALAMAT TOKEN ANDA!
const TOKEN_ADDRESS = "0x9e12fAB4756d2D949618672eF76c03F8461a435d";

async function main() {
  try {
    // Dapatkan signers
    const signers = await ethers.getSigners();

    if (signers.length === 0) {
      throw new Error("No signers available");
    }

    const owner = signers[0];
    const ownerAddress = await owner.getAddress();

    console.log(`Using owner address: ${ownerAddress}`);
    console.log(`Interacting with token at ${TOKEN_ADDRESS}`);

    // Connect ke Token contract
    const Token = await ethers.getContractFactory("Token");
    const token = (await Token.attach(TOKEN_ADDRESS)) as Token;

    // Dapatkan informasi token
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();

    console.log("\nToken Information:");
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Decimals: ${decimals}`);
    console.log(
      `- Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`
    );

    // Cek balance owner
    const ownerBalance = await token.balanceOf(ownerAddress);
    console.log(
      `\nBalance of ${ownerAddress}: ${ethers.formatUnits(
        ownerBalance,
        decimals
      )} ${symbol}`
    );

    // Menguji fungsi pembakaran token (hanya owner)
    const burnAmount = 500;

    // Verifikasi jika kita memiliki cukup token untuk dibakar
    if (ownerBalance >= ethers.parseUnits(burnAmount.toString(), decimals)) {
      console.log(`\nBurning ${burnAmount} tokens...`);
      const burnTx = await token.burnToken(burnAmount);
      await burnTx.wait();

      // Cek total supply dan balance setelah pembakaran
      const newTotalSupply = await token.totalSupply();
      const finalOwnerBalance = await token.balanceOf(ownerAddress);

      console.log("\nAfter burning:");
      console.log(
        `- Total Supply: ${ethers.formatUnits(
          newTotalSupply,
          decimals
        )} ${symbol}`
      );
      console.log(
        `- Owner Balance: ${ethers.formatUnits(
          finalOwnerBalance,
          decimals
        )} ${symbol}`
      );
    } else {
      console.log(`\nInsufficient balance for burning ${burnAmount} tokens.`);
      console.log(
        `Current balance: ${ethers.formatUnits(
          ownerBalance,
          decimals
        )} ${symbol}`
      );
    }
  } catch (error) {
    console.error("Error interacting with token:");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
