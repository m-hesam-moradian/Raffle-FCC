const { network, ethers, config } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

let vrfCoordinatorAddress, subscriptionId

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let keyHash = networkConfig[chainId]["keyHash"]
    //get entrance value from config .env
    const entranceValue = networkConfig[chainId]["entranceValue"]

    if (developmentChains.includes(network.name)) {
        const subData = await deployments.get("MySubscription&VRFcoordinator")
        subscriptionId = subData.linkedData.subscriptionId
        vrfCoordinatorAddress = subData.linkedData.VRFcoordinator
        console.log("Using subscription ID:", subscriptionId)
    } else {
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const args = [subscriptionId, vrfCoordinatorAddress, keyHash, entranceValue]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
    })

    log("Raffle deployed at:", raffle.address)
    log("--------------------------------")

    if (developmentChains.includes(network.name)) {
        //Add the consumer contract to your subscription
        const vrfCoordinatorV2_5MockInstance = await ethers.getContractAt(
            "VRFCoordinatorV2_5Mock", // Contract name (must match exactly)
            vrfCoordinatorAddress, // Contract address
        )

        const tx = await vrfCoordinatorV2_5MockInstance.addConsumer(subscriptionId, raffle.address)
        await tx.wait(1)
        log("Consumer added to subscription:", subscriptionId)
        log("----------------------------------------------------")
    }
}
module.exports.tags = ["all", "raffle"]
