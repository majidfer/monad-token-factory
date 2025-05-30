// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Token.sol";

/**
 * @title TokenFactory
 * @dev Contract factory untuk membuat token ERC20 baru
 */
contract TokenFactory {
    // Array untuk menyimpan alamat semua token yang telah dibuat
    address[] public createdTokens;

    // Event yang dipancarkan saat token baru dibuat
    event createTokenEvent(
        address indexed owner,
        address indexed tokenAddress,
        uint256 totalSupply
    );

    /**
     * @dev Fungsi untuk membuat token ERC20 baru
     * @param initialOwner Alamat pemilik awal token
     * @param initialSupply Jumlah awal token yang akan dicetak
     * @param tokenName Nama token yang akan dibuat
     * @param tokenSymbol Simbol token yang akan dibuat
     * @return Alamat contract token baru
     */
    function createToken(
        address initialOwner,
        uint256 initialSupply,
        string memory tokenName,
        string memory tokenSymbol
    ) public returns (address) {
        // Buat instance token baru
        Token newToken = new Token(
            initialOwner,
            initialSupply,
            tokenName,
            tokenSymbol
        );

        // Simpan alamat token dalam array
        createdTokens.push(address(newToken));

        // Pancarkan event dengan informasi token baru
        emit createTokenEvent(initialOwner, address(newToken), initialSupply);

        // Kembalikan alamat token yang baru dibuat
        return address(newToken);
    }

    /**
     * @dev Fungsi untuk mendapatkan daftar semua token yang telah dibuat
     * @return Array alamat semua token
     */
    function getAllTokens() public view returns (address[] memory) {
        return createdTokens;
    }

    /**
     * @dev Fungsi untuk mendapatkan jumlah token yang telah dibuat
     * @return Jumlah token
     */
    function getTokensCount() public view returns (uint256) {
        return createdTokens.length;
    }
}
