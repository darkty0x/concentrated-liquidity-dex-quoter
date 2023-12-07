import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { HardhatUserConfig } from "hardhat/config";

require("dotenv").config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.ALCHEMY_RPC_URL,
      },
    },
  },
  paths: {
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.21",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 1000000,
  },
};

export default config;
