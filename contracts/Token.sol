// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Token
 * @dev Contract untuk token ERC20 yang dapat dibuat oleh TokenFactory
 */
contract Token is ERC20, Ownable {
    /**
     * @dev Constructor untuk membuat token baru dengan parameter yang ditentukan
     * @param initialOwner Alamat pemilik awal token
     * @param initialSupply Jumlah awal token yang akan dicetak (dalam satuan token utuh)
     * @param tokenName Nama token yang akan dibuat
     * @param tokenSymbol Simbol token yang akan dibuat
     */
    constructor(
        address initialOwner,
        uint256 initialSupply,
        string memory tokenName,
        string memory tokenSymbol
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        // Transfer kepemilikan ke pemilik awal
        _transferOwnership(initialOwner);

        // Mencetak token awal dengan menyesuaikan jumlah desimal
        // Contoh: 1000 token dengan 18 desimal menjadi 1000 * 10^18
        _mint(initialOwner, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Fungsi untuk membakar (burn) token
     * @param burnAmount Jumlah token yang akan dibakar (dalam satuan token utuh)
     */
    function burnToken(uint256 burnAmount) public onlyOwner {
        // Cek apakah pemilik memiliki cukup token untuk dibakar
        require(
            balanceOf(msg.sender) >= burnAmount * 10 ** decimals(),
            "Error: you need more tokens"
        );

        // Bakar token dari pemilik sesuai jumlah yang ditentukan
        _burn(msg.sender, burnAmount * 10 ** decimals());
    }
}
