import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenFactory, Token } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenFactory Contract", function () {
  // Variabel untuk menyimpan instance contract dan akun
  let TokenFactory: any;
  let tokenFactory: TokenFactory;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Konstanta untuk test
  const TOKEN_NAME = "Test Token";
  const TOKEN_SYMBOL = "TST";
  const INITIAL_SUPPLY = 1000000; // 1 juta token

  // Setup sebelum setiap test case
  beforeEach(async function () {
    // Dapatkan ContractFactory dan akun untuk testing
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TokenFactory
    tokenFactory = await TokenFactory.deploy();
    await tokenFactory.waitForDeployment();
  });

  // Test suite dimulai di sini
  describe("Deployment", function () {
    it("Seharusnya memiliki jumlah token awal 0", async function () {
      expect(await tokenFactory.getTokensCount()).to.equal(0);
      expect(await tokenFactory.getAllTokens()).to.be.an("array").that.is.empty;
    });
  });

  describe("Token Creation", function () {
    it("Seharusnya berhasil membuat token baru", async function () {
      // Buat token baru
      const tx = await tokenFactory.createToken(
        owner.address,
        INITIAL_SUPPLY,
        TOKEN_NAME,
        TOKEN_SYMBOL
      );

      // Tunggu transaksi selesai
      const receipt = await tx.wait();

      // Verifikasi jumlah token bertambah
      expect(await tokenFactory.getTokensCount()).to.equal(1);

      // Ambil alamat token yang baru dibuat
      const tokenAddresses = await tokenFactory.getAllTokens();
      expect(tokenAddresses.length).to.equal(1);

      // Verifikasi event dipancarkan dengan benar
      await expect(tx)
        .to.emit(tokenFactory, "createTokenEvent")
        .withArgs(owner.address, tokenAddresses[0], INITIAL_SUPPLY);

      // Test interaksi dengan token yang baru dibuat
      const Token = await ethers.getContractFactory("Token");
      const newToken = Token.attach(tokenAddresses[0]) as Token;

      // Verifikasi properti token
      expect(await newToken.name()).to.equal(TOKEN_NAME);
      expect(await newToken.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await newToken.decimals()).to.equal(18);

      // Verifikasi supply dan balance
      const expectedSupply = ethers.parseUnits(INITIAL_SUPPLY.toString(), 18);
      expect(await newToken.totalSupply()).to.equal(expectedSupply);
      expect(await newToken.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Seharusnya memungkinkan user lain membuat token", async function () {
      // User1 membuat token
      await tokenFactory
        .connect(user1)
        .createToken(user1.address, INITIAL_SUPPLY, "User1 Token", "UT1");

      // User2 membuat token
      await tokenFactory
        .connect(user2)
        .createToken(user2.address, INITIAL_SUPPLY * 2, "User2 Token", "UT2");

      // Verifikasi jumlah token
      expect(await tokenFactory.getTokensCount()).to.equal(2);

      // Ambil alamat token
      const tokenAddresses = await tokenFactory.getAllTokens();

      // Test token user1
      const Token = await ethers.getContractFactory("Token");
      const user1Token = Token.attach(tokenAddresses[0]) as Token;
      const user2Token = Token.attach(tokenAddresses[1]) as Token;

      // Verifikasi nama dan kepemilikan
      expect(await user1Token.name()).to.equal("User1 Token");
      expect(await user2Token.name()).to.equal("User2 Token");

      // Verifikasi supply
      const expectedSupply1 = ethers.parseUnits(INITIAL_SUPPLY.toString(), 18);
      const expectedSupply2 = ethers.parseUnits(
        (INITIAL_SUPPLY * 2).toString(),
        18
      );

      expect(await user1Token.balanceOf(user1.address)).to.equal(
        expectedSupply1
      );
      expect(await user2Token.balanceOf(user2.address)).to.equal(
        expectedSupply2
      );
    });
  });

  describe("Token Functionality", function () {
    let newTokenAddress: string;
    let newToken: Token;

    beforeEach(async function () {
      // Buat token baru untuk setiap test
      const tx = await tokenFactory.createToken(
        owner.address,
        INITIAL_SUPPLY,
        TOKEN_NAME,
        TOKEN_SYMBOL
      );
      await tx.wait();

      // Ambil alamat token yang baru dibuat
      const tokenAddresses = await tokenFactory.getAllTokens();
      newTokenAddress = tokenAddresses[0];

      // Attach ke token
      const Token = await ethers.getContractFactory("Token");
      newToken = Token.attach(newTokenAddress) as Token;
    });

    it("Seharusnya dapat membakar token", async function () {
      // Jumlah token yang akan dibakar
      const burnAmount = 1000; // 1000 token
      const burnAmountInWei = ethers.parseUnits(burnAmount.toString(), 18);

      // Cek balance awal
      const initialBalance = await newToken.balanceOf(owner.address);

      // Bakar token
      await newToken.burnToken(burnAmount);

      // Cek balance setelah pembakaran
      const finalBalance = await newToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance - burnAmountInWei);

      // Cek total supply juga berkurang
      const totalSupply = await newToken.totalSupply();
      const expectedSupply =
        ethers.parseUnits(INITIAL_SUPPLY.toString(), 18) - burnAmountInWei;
      expect(totalSupply).to.equal(expectedSupply);
    });

    it("Seharusnya gagal jika non-owner mencoba membakar token", async function () {
      // User1 mencoba membakar token (seharusnya gagal)
      await expect(
        newToken.connect(user1).burnToken(1000)
      ).to.be.revertedWithCustomError(newToken, "OwnableUnauthorizedAccount");
    });

    it("Seharusnya gagal jika mencoba membakar lebih dari balance", async function () {
      // Mencoba membakar lebih dari balance (seharusnya gagal)
      await expect(newToken.burnToken(INITIAL_SUPPLY + 1)).to.be.revertedWith(
        "Error: you need more tokens"
      );
    });
  });
});
