const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

describe("Raffle tests:", function () {
    let raffle, vrfCoordinatorV2Mock, deployer

    beforeEach(async () => {
        await deployments.fixture(["mocks", "raffle"]) // Make sure your deploy scripts have these tags

        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", deployer)
    })

    it("should deploy raffle and mock coordinator correctly", async () => {
        const subId = await raffle.getSubscriptionId()
        console.log("VRF Subscription ID:", subId)

        const isSubFunded = await vrfCoordinatorV2Mock.getSubscription(subId)
        console.log("Mock subscription funded:", isSubFunded.balance.toString())
    })
})
