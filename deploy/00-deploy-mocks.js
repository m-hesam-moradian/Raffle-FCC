const { ethers, deployments } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log("Deployer:", deployer)

    const baseFee = ethers.parseUnits("0.00025", "ether") // 0.00025 ETH
    const gasPrice = ethers.parseUnits("1", "gwei") // 1 gwei
    const weiPerUnitLink = ethers.parseUnits("0.1", "ether")
    console.log("Args:", [baseFee, gasPrice, weiPerUnitLink])

    // Deploy the contract
    const vrfCoordinatorV2_5Mock = await deploy("VRFCoordinatorV2_5Mock", {
        from: deployer,
        log: true,
        args: [baseFee, gasPrice, weiPerUnitLink],
    })

    console.log("----------------------------------------------------")
    console.log("Mocks deployed at:", vrfCoordinatorV2_5Mock.address) // Contract address
    console.log("----------------------------------------------------")

    const vrfCoordinatorV2_5MockInstance = await ethers.getContractAt(
        "VRFCoordinatorV2_5Mock", // Contract name (must match exactly)
        vrfCoordinatorV2_5Mock.address, // Contract address
    )

    let tx = await vrfCoordinatorV2_5MockInstance.createSubscription()
    let receipt = await tx.wait(1)
    const subscriptionId = receipt.logs[0].args.subId.toString()
    console.log("Subscription created:", subscriptionId)
    console.log("----------------------------------------------------")

    // Fund the subscription
    const fundAmount = ethers.parseUnits("1", "ether")
    tx = await vrfCoordinatorV2_5MockInstance.fundSubscription(subscriptionId, fundAmount)
    await tx.wait(1)
    console.log("Subscription funded with:", fundAmount.toString(), "LINK")
    console.log("----------------------------------------------------")
    await deployments.save("MySubscription&VRFcoordinator", {
        address: "0x0000000000000000000000000000000000000000", // dummy
        abi: [],
        args: [],
        linkedData: {
            subscriptionId: subscriptionId.toString(),
            VRFcoordinator: vrfCoordinatorV2_5Mock.address.toString(),
        },
    })
}

module.exports.tags = ["mocks"]
