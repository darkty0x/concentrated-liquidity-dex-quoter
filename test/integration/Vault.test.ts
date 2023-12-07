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

    it('should only allow a user to withdraw the amount they deposited', async () => {
        // Whitelist the token
        await vault.connect(owner).whitelistToken(token.address);
        await token.connect(user).approve(vault.address, 100);
        await token.connect(user2).approve(vault.address, 100);

        // Deposit tokens for both users
        await vault.connect(user).deposit(token.address, 50);
        await vault.connect(user2).deposit(token.address, 75);

        // Ensure deposited amounts for both users
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(50);
        expect(await vault.userDeposits(token.address, user2.getAddress())).to.equal(75);

        // Trying to withdraw more than deposited amount should revert
        await expect(
            vault.connect(user).withdraw(token.address, 75)
        ).to.be.revertedWithCustomError(vault, "ERR_INVALID_AMOUNT");

        // Withdraw the correct amount for both users
        await expect(
            vault.connect(user).withdraw(token.address, 50)
        ).to.not.be.reverted;
        await expect(
            vault.connect(user2).withdraw(token.address, 75)
        ).to.not.be.reverted;

        // Ensure deposited amounts are updated after withdrawals
        expect(await vault.userDeposits(token.address, user.getAddress())).to.equal(0);
        expect(await vault.userDeposits(token.address, user2.getAddress())).to.equal(0);
    });
});
