# Vault contract

A simple Vault contract with specific requirements (Tsunami Test)

## Requirements

Write a “Vault” solidity contract

### Functionality

1. **Deposit and Withdraw:**
   - There should be a ‘deposit’ and ‘withdraw’ function that any user can use to deposit and withdraw any whitelisted ERC-20 token on the contract.

2. **Admin Functions:**
   - There should be three additional functions that only admins can call.
     - `pause`: Prevents new deposits or withdrawals from occurring.
     - `unpause`: Enables new deposits or withdrawals.
     - `whitelistToken`: Admins can call this function to whitelist tokens.

### Code Repository and Testing

3. **Testing:**
   - The code repository should contain testing for the contract.
   - Instructions for running tests should be included in the readme.

### Usability

4. **User Accessibility:**
   - The vault should be usable by any number of users.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed.

### Install dependencies:

```bash
npm install
```
or
```bash
yarn
```

## Usage

### Compile the Smart Contracts:

```bash
npm run compile
```
or
```bash
yarn compile
```

### Run Tests:

```bash
npm test
```
or
```bash
yarn test
```

### To generate a gas usage report:

```bash
npm run gas
```

### To generate a test coverage report:

```bash
npm run coverage
```
or
```bash
yarn coverage
```

## Local Development:

### Run a local Hardhat node:

```bash
npm run start
```
or
```bash
yarn start
```

### Deploy the contract to the local network:

```bash
npm run deploy:local
```
or
```bash
yarn deploy:local
```

## Contributing
Feel free to contribute to the development of this project. Follow these steps:

1. Fork the repository.

2. Create a new branch: git checkout -b feature/my-feature.

3. Commit your changes: git commit -m 'Add my feature'.

4. Push to the branch: git push origin feature/my-feature.

5. Submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/kazunetakeda25/simple-vault/blob/main/LICENSE) file for details.


## Note

Coverage is not 100% because Else paths for modifiers (`nonReentrant`, `onlyOwner`) were not tested since they are from OpenZeppelin. These modifiers are widely used and thoroughly tested in the OpenZeppelin library, which is a trusted and well-established collection of reusable smart contract components. As a result, I have focused my testing efforts on the specific logic and functionalities unique to this Vault contract.

  Vault

    ✔ should only allow a user to withdraw the amount they deposited (109ms)

    ✔ should revert when depositing a non-whitelisted token

    ✔ should revert when withdrawing a non-whitelisted token

    ✔ should revert when depositing with amount equal to 0

    ✔ should revert when withdrawing with amount equal to 0

    ✔ should deposit and withdraw tokens (52ms)

    ✔ should not revert when token is whitelisted

    ✔ should pause and unpause the vault

    ✔ should not allow deposit when paused

    ✔ should not allow withdraw when paused

    ✔ should revert when whitelisting address(0)

    ✔ should whitelist and remove tokens

  12 passing (506ms)

File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |      100 |    78.57 |      100 |       96 |                |
  Vault.sol            |      100 |    78.57 |      100 |       96 |             34 |
 contracts/Mock/       |      100 |      100 |      100 |      100 |                |
  MockERC20.sol        |      100 |      100 |      100 |      100 |                |
 contracts/interfaces/ |      100 |      100 |      100 |      100 |                |
  IVault.sol           |      100 |      100 |      100 |      100 |                |
All files              |      100 |    71.43 |      100 |    96.15 |                |
