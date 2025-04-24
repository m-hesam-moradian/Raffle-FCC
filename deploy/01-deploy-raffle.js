// const { network, ethers } = require("hardhat")
// const { networkConfig, developmentChains } = require("../helper-hardhat-config")

// module.exports = async ({ getNamedAccounts, deployments }) => {
//     const { deploy, log, get } = deployments
//     const { deployer } = await getNamedAccounts()
//     const chainId = network.config.chainId

//     let vrfCoordinatorV2Address
//     let subscriptionId
//     let keyHash = networkConfig[chainId]["keyHash"]

//     if (developmentChains.includes(network.name)) {
//         const vrfCoordinatorV2Mock = await get("VRFCoordinatorV2Mock")
//         vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
//         subscriptionId = networkConfig[chainId]["subscriptionId"]
//     } else {
//         vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
//         subscriptionId = networkConfig[chainId]["subscriptionId"]
//     }

//     const args = [subscriptionId, vrfCoordinatorV2Address, keyHash]

//     const raffle = await deploy("Raffle", {
//         from: deployer,
//         args: args,
//         log: true,
//         waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
//     })

//     log("Raffle deployed at:", raffle.address)
//     log("--------------------------------")
// }

// module.exports.tags = ["all", "raffle"]
