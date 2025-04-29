require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
require("hardhat-deploy")
// <- THIS IS IMPORTANT

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
        // example for testnet
        // goerli: {
        //     url: RPC_URL,
        //     accounts: [PRIVATE_KEY],
        //     chainId: 5,
        // },
    },
    solidity: {
        version: "0.8.28",
    },
    namedAccounts: {
        deployer: {
            default: 0, // first account by default
        },
    },
    // etherscan: {
    //     apiKey: ETHERSCAN_API_KEY,
    // },
    // mocha: {
    //     timeout: 200000, // optional, for longer tests
    // },
}
