// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// Openzeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// Interfaces
import "./interfaces/IVault.sol";

// Custom Error Types
error ERR_ETH_NOT_ACCEPTED();
error ERR_INVALID_AMOUNT();
error ERR_TOKEN_NOT_WHITELISTED(address token);

/**
 * @title Vault
 * @dev A smart contract for handling deposits and withdrawals of ERC-20 tokens with admin controls.
 * @author kazunetakeda25
 */
contract Vault is IVault, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    mapping(address => bool) public whitelistedTokens;

    /**
     * @dev Fallback function to revert accidental transfers.
     */
    receive() external payable {
        revert ERR_ETH_NOT_ACCEPTED();
    }

    /**
     * @dev Deposits ERC-20 tokens into the vault.
     * @param _token The address of the ERC-20 token.
     * @param _amount The amount of tokens to deposit.
     */
    function deposit(
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        if (!whitelistedTokens[_token]) {
            revert ERR_TOKEN_NOT_WHITELISTED(_token);
        }

        if (_amount == 0) {
            revert ERR_INVALID_AMOUNT();
        }

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        emit Deposit(msg.sender, _token, _amount);
    }

    /**
     * @dev Withdraws ERC-20 tokens from the vault.
     * @param _token The address of the ERC-20 token.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdraw(
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        if (!whitelistedTokens[_token]) {
            revert ERR_TOKEN_NOT_WHITELISTED(_token);
        }

        if (_amount == 0) {
            revert ERR_INVALID_AMOUNT();
        }

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdrawal(msg.sender, _token, _amount);
    }

    /**
     * @dev Pauses deposits and withdrawals.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses deposits and withdrawals.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Whitelists an ERC-20 token for deposits and withdrawals.
     * @param _token The address of the ERC-20 token to whitelist.
     */
    function whitelistToken(address _token) external onlyOwner {
        whitelistedTokens[_token] = true;

        emit TokenWhitelisted(_token);
    }

    /**
     * @dev Removes an ERC-20 token from the whitelist.
     * @param _token The address of the ERC-20 token to remove from the whitelist.
     */
    function removeTokenFromWhitelist(address _token) external onlyOwner {
        delete whitelistedTokens[_token];

        emit TokenRemovedFromWhitelist(_token);
    }
}
