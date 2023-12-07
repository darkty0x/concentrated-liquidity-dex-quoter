// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVault
 * @dev An interface for Vault contract
 * @author kazunetakeda25
 */
interface IVault {
    // Events
    event Deposit(address indexed from, address indexed token, uint256 amount);
    event Withdrawal(address indexed to, address indexed token, uint256 amount);
    event TokenWhitelisted(address indexed token);
    event TokenRemovedFromWhitelist(address indexed token);

    // Methods
    /**
     * @dev Deposits ERC-20 tokens into the vault.
     * @param token The address of the ERC-20 token.
     * @param amount The amount of tokens to deposit.
     */
    function deposit(address token, uint256 amount) external;

    /**
     * @dev Withdraws ERC-20 tokens from the vault.
     * @param token The address of the ERC-20 token.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(address token, uint256 amount) external;
}
