const { ethers } = require("hardhat")

const { ENTRANCE_VALUE } = process.env
const networkConfig = {
    31337: {
        name: "localhost",
        subscriptionId: "1",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        entranceValue: ethers.parseEther(ENTRANCE_VALUE || "0.01"),
    },
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "YOUR_SEPOLIA_COORDINATOR",
        subscriptionId: "YOUR_SUBSCRIPTION_ID",
        keyHash: "YOUR_KEY_HASH",
        blockConfirmations: 6,
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
