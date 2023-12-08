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
        [owner, user, user2] = await ethers.getSigners();

        const Vault = await ethers.getContractFactory('Vault');
        vault = await Vault.connect(owner).deploy();
        await vault.deployed();

        const Token = await ethers.getContractFactory('MockERC20');
        token = await Token.connect(user).deploy();
        await token.deployed();

        // Send tokens to user2
        await token.connect(user).transfer(await user2.getAddress(), 100);
    });

    it('should allow multiple users to withdraw up to their deposited amount even when the entered withdrawal amount exceeds the deposited amount', async () => {
        // Whitelist the token
        await vault.connect(owner).whitelistToken(token.address);

        // Deposit tokens for user
        await token.connect(user).approve(vault.address, 50);
        await vault.connect(user).deposit(token.address, 50);

        // Deposit tokens for user2
        await token.connect(user2).approve(vault.address, 75);
        await vault.connect(user2).deposit(token.address, 75);

        // Ensure deposited amounts for both users
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(50);
        expect(await vault.userDeposits(token.address, user2.getAddress())).to.equal(75);

        // Users attempt to withdraw more than their deposited amount
        await expect(
            vault.connect(user).withdraw(token.address, 75)
        ).to.not.be.reverted;

        await expect(
            vault.connect(user2).withdraw(token.address, 100)
        ).to.not.be.reverted;

        // Ensure deposited amounts are updated after withdrawals
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(0);
        expect(await vault.userDeposits(token.address, user2.getAddress())).to.equal(0);

        // Ensure that the token balance in the vault is unchanged
        expect(await token.balanceOf(vault.address)).to.equal(0);
    });

    it('should handle withdrawals when a user has multiple deposits', async () => {
        // Whitelist the token
        await vault.connect(owner).whitelistToken(token.address);

        // Deposit tokens for user
        await token.connect(user).approve(vault.address, 50);
        await vault.connect(user).deposit(token.address, 50);

        // Deposit additional tokens for user
        await token.connect(user).approve(vault.address, 30);
        await vault.connect(user).deposit(token.address, 30);

        // Ensure total deposited amount for the user
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(80);

        // User attempts to withdraw an amount less than the total deposited
        await expect(
            vault.connect(user).withdraw(token.address, 70)
        ).to.not.be.reverted;

        // Ensure deposited amount is updated after withdrawal
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(10);

        // Ensure that the token balance in the vault is unchanged
        expect(await token.balanceOf(vault.address)).to.equal(10);
    });
});
