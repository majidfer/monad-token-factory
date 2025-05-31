// Script untuk membuat token baru dengan TokenFactory
import { ethers } from "hardhat";
import { TokenFactory } from "../typechain-types";

// Alamat contract TokenFactory yang sudah di-deploy
// GANTI DENGAN ALAMAT HASIL DEPLOYMENT ANDA!
const FACTORY_ADDRESS = "0x8FF02FC12dc4B3cA9A64F4E708b57541019D03CC";

// Parameter untuk token baru
const TOKEN_NAME = "MJDEV Monad Test Token";
const TOKEN_SYMBOL = "MJDEV";
const INITIAL_SUPPLY = 1000000; // 1 juta token

async function main() {
  try {
    // Dapatkan signer pertama sebagai pemilik token
    const [deployer] = await ethers.getSigners();
    const ownerAddress = await deployer.getAddress();

    // Tampilkan detail token yang akan dibuat
    console.log(`Creating token as owner: ${ownerAddress}`);
    console.log(`Token details:`);
    console.log(`- Name: ${TOKEN_NAME}`);
    console.log(`- Symbol: ${TOKEN_SYMBOL}`);
    console.log(`- Initial Supply: ${INITIAL_SUPPLY.toLocaleString()} tokens`);

    // Connect ke TokenFactory yang sudah di-deploy
    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    const factory = (await TokenFactory.attach(
      FACTORY_ADDRESS
    )) as TokenFactory;

    // Buat token baru
    console.log(
      `\nCreating new token via TokenFactory at ${FACTORY_ADDRESS}...`
    );
    const tx = await factory.createToken(
      ownerAddress,
      INITIAL_SUPPLY,
      TOKEN_NAME,
      TOKEN_SYMBOL
    );

    // Tunggu konfirmasi transaksi
    console.log(`Transaction sent, waiting for confirmation...`);
    const receipt = await tx.wait();

    // Ambil event createTokenEvent untuk mendapatkan alamat token baru
    const event = receipt?.logs.filter((log) => {
      try {
        const parsedLog = factory.interface.parseLog(log as any);
        return parsedLog?.name === "createTokenEvent";
      } catch {
        return false;
      }
    })[0];

    const parsedEvent = factory.interface.parseLog(event as any);
    const newTokenAddress = parsedEvent?.args[1];

    // Tampilkan informasi token yang berhasil dibuat
    console.log(`\nToken created successfully!`);
    console.log(`New token address: ${newTokenAddress}`);
    console.log(`\nView the token on Monad Testnet Explorer:`);
    console.log(`https://testnet.monadexplorer.com/address/${newTokenAddress}`);

    // Dapatkan jumlah token yang telah dibuat
    const tokenCount = await factory.getTokensCount();
    console.log(`\nTotal tokens created by this factory: ${tokenCount}`);
  } catch (error) {
    console.error("Error creating token:");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
