import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("Vault", function () {
    let owner: Signer;
    let user: Signer;
    let user2: Signer;
    let vault: Contract;
    let token: Contract;

    before(async () => {
        [owner, user] = await ethers.getSigners();

        const Vault = await ethers.getContractFactory('Vault');
        vault = await Vault.connect(owner).deploy();
        await vault.deployed();

        const Token = await ethers.getContractFactory('MockERC20');
        token = await Token.connect(user).deploy();
        await token.deployed();
    });

    it('should revert when depositing a non-whitelisted token', async () => {
        // Ensure that the token is not whitelisted initially
        expect(await vault.whitelistedTokens(token.address)).to.equal(false);

        // Trying to deposit without whitelisting the token should revert
        await expect(
            vault.connect(user).deposit(token.address, 50)
        ).to.be.revertedWithCustomError(vault, "ERR_TOKEN_NOT_WHITELISTED");
    });

    it('should revert when withdrawing a non-whitelisted token', async () => {
        // Ensure that the token is not whitelisted initially
        expect(await vault.whitelistedTokens(token.address)).to.equal(false);

        // Trying to withdraw without whitelisting the token should revert
        await expect(
            vault.connect(user).withdraw(token.address, 25)
        ).to.be.revertedWithCustomError(vault, "ERR_TOKEN_NOT_WHITELISTED");
    });

    it('should revert when depositing with amount equal to 0', async () => {
        // Ensure that the token is whitelisted
        await vault.connect(owner).whitelistToken(token.address);

        // Trying to deposit with amount equal to 0 should revert
        await expect(
            vault.connect(user).deposit(token.address, 0)
        ).to.be.revertedWithCustomError(vault, "ERR_INVALID_AMOUNT");

        // Ensure that the token balance in the vault is unchanged
        expect(await token.balanceOf(vault.address)).to.equal(0);
    });

    it('should revert when withdrawing with amount equal to 0', async () => {
        // Trying to withdraw with amount equal to 0 should revert
        await expect(
            vault.connect(user).withdraw(token.address, 0)
        ).to.be.revertedWithCustomError(vault, "ERR_INVALID_AMOUNT");
    });

    it('should deposit and withdraw tokens', async () => {
        await vault.connect(owner).whitelistToken(token.address);
        await token.connect(user).approve(vault.address, 100);

        // Deposit tokens
        expect(await vault.connect(user).deposit(token.address, 50))
            .to.be.emit(vault, 'Deposit')
            .withArgs(user.getAddress(), token.address, 50);

        // Ensure token balance in the vault
        expect(await token.balanceOf(vault.address)).to.equal(50);

        // Withdraw tokens
        expect(await vault.connect(user).withdraw(token.address, 25))
            .to.be.emit(vault, 'Withdrawal')
            .withArgs(user.getAddress(), token.address, 25);
    });

    it('should not revert when token is whitelisted', async () => {
        // Whitelist the token
        await vault.connect(owner).whitelistToken(token.address);

        // Trying to deposit and withdraw should not revert
        await expect(
            vault.connect(user).deposit(token.address, 50)
        ).to.not.be.reverted;

        await expect(
            vault.connect(user).withdraw(token.address, 25)
        ).to.not.be.reverted;
    });

    it('should pause and unpause the vault', async () => {
        await expect(vault.connect(owner).pause())
            .to.emit(vault, 'Paused');

        expect(await vault.paused()).to.equal(true);

        await expect(vault.connect(owner).unpause())
            .to.emit(vault, 'Unpaused');

        expect(await vault.paused()).to.equal(false);
    });

    it('should allow only owner to pause and unpause', async () => {
        // Ensure the contract is initially unpaused
        expect(await vault.paused()).to.equal(false);

        // Trying to pause the contract as a non-owner should revert
        await expect(
            vault.connect(user).pause()
        ).to.be.revertedWith('Ownable: caller is not the owner');

        // Ensure the contract is still unpaused after the attempted operation
        expect(await vault.paused()).to.equal(false);

        // Pause the contract as the owner
        await expect(
            vault.connect(owner).pause()
        ).to.emit(vault, 'Paused');

        // Ensure the contract is now paused
        expect(await vault.paused()).to.equal(true);

        // Trying to unpause the contract as a non-owner should revert
        await expect(
            vault.connect(user).unpause()
        ).to.be.revertedWith('Ownable: caller is not the owner');

        // Ensure the contract is still paused after the attempted operation
        expect(await vault.paused()).to.equal(true);

        // Unpause the contract as the owner
        await expect(
            vault.connect(owner).unpause()
        ).to.emit(vault, 'Unpaused');

        // Ensure the contract is now unpaused
        expect(await vault.paused()).to.equal(false);
    });

    it('should not allow deposit when paused', async () => {
        // Whitelist the token
        await vault.connect(owner).whitelistToken(token.address);
        await vault.connect(owner).pause();

        // Ensure the contract is paused
        expect(await vault.paused()).to.equal(true);

        // Trying to deposit when paused should revert
        await expect(
            vault.connect(user).deposit(token.address, 50)
        ).to.be.revertedWith('Pausable: paused');
    });

    it('should not allow withdraw when paused', async () => {
        // Trying to withdraw when paused should revert
        await expect(
            vault.connect(user).withdraw(token.address, 25)
        ).to.be.revertedWith('Pausable: paused');
    });

    it('should revert when whitelisting address(0)', async () => {
        // Ensure that the token is not whitelisted initially
        expect(await vault.whitelistedTokens(ethers.constants.AddressZero)).to.equal(false);

        // Trying to whitelist address(0) should revert
        await expect(
            vault.connect(owner).whitelistToken(ethers.constants.AddressZero)
        ).to.be.revertedWithCustomError(vault, "ERR_ZERO_ADDRESS");

        // Ensure that the token is still not whitelisted after the attempted operation
        expect(await vault.whitelistedTokens(ethers.constants.AddressZero)).to.equal(false);
    });

    it('should whitelist and remove tokens', async () => {
        // Whitelist the token
        await expect(vault.connect(owner).whitelistToken(token.address))
            .to.emit(vault, 'TokenWhitelisted')
            .withArgs(token.address);

        expect(await vault.whitelistedTokens(token.address)).to.equal(true);

        // Remove the token from the whitelist
        await expect(vault.connect(owner).removeTokenFromWhitelist(token.address))
            .to.emit(vault, 'TokenRemovedFromWhitelist')
            .withArgs(token.address);

        expect(await vault.whitelistedTokens(token.address)).to.equal(false);
    });

    it('should allow only owner to whitelist token', async () => {
        // Ensure that the token is not whitelisted initially
        expect(await vault.whitelistedTokens(token.address)).to.equal(false);

        // Trying to whitelist the token as a non-owner should revert
        await expect(
            vault.connect(user).whitelistToken(token.address)
        ).to.be.revertedWith('Ownable: caller is not the owner');

        // Ensure that the token is still not whitelisted after the attempted operation
        expect(await vault.whitelistedTokens(token.address)).to.equal(false);

        // Whitelist the token as the owner
        await expect(
            vault.connect(owner).whitelistToken(token.address)
        ).to.emit(vault, 'TokenWhitelisted').withArgs(token.address);

        // Ensure that the token is now whitelisted
        expect(await vault.whitelistedTokens(token.address)).to.equal(true);
    });

    it('should allow only owner to remove token from whitelist', async () => {
        // Whitelist the token initially
        await vault.connect(owner).whitelistToken(token.address);

        // Ensure that the token is whitelisted
        expect(await vault.whitelistedTokens(token.address)).to.equal(true);

        // Trying to remove the token from the whitelist as a non-owner should revert
        await expect(
            vault.connect(user).removeTokenFromWhitelist(token.address)
        ).to.be.revertedWith('Ownable: caller is not the owner');

        // Ensure that the token is still whitelisted after the attempted operation
        expect(await vault.whitelistedTokens(token.address)).to.equal(true);

        // Remove the token from the whitelist as the owner
        await expect(
            vault.connect(owner).removeTokenFromWhitelist(token.address)
        ).to.emit(vault, 'TokenRemovedFromWhitelist').withArgs(token.address);

        // Ensure that the token is no longer whitelisted
        expect(await vault.whitelistedTokens(token.address)).to.equal(false);
    });
});
