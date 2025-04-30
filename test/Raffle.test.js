const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { expect } = require("chai")
const { networkConfig } = require("../helper-hardhat-config")

describe("Raffle Smart Contract Tests", function () {
    let raffle,
        vrfCoordinatorV2Mock,
        deployer,
        vrfCoordinatorAddress,
        subscriptionId,
        playersAddress

    // Ensure the deployment fixtures are loaded correctly before each test
    beforeEach(async () => {
        // Deploy necessary contracts using the fixture tags
        await deployments.fixture(["mocks", "raffle"])

        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", deployer)

        const subData = await deployments.get("MySubscription&VRFcoordinator")
        subscriptionId = subData.linkedData.subscriptionId
        vrfCoordinatorAddress = subData.linkedData.VRFcoordinator
        playersAddress = await raffle.getPlayers()
    })

    describe("Raffle and VRF Coordinator Mock Deployment", function () {
        // Verify the deployment of VRF Coordinator
        it("should deploy VRF coordinator correctly", async () => {
            const vrfCoordinatorAddressFromContract = vrfCoordinatorV2Mock.target
            expect(vrfCoordinatorAddressFromContract).to.equal(vrfCoordinatorAddress)
        })

        // Verify that the Subscription ID exists and is valid
        it("should verify if subscription ID is valid", async () => {
            let isValid = false
            try {
                const sub = await vrfCoordinatorV2Mock.getSubscription(subscriptionId)
                isValid = sub !== null // Ensure subscription exists
            } catch (error) {
                console.error("Subscription does not exist:", error)
            }
            expect(isValid).to.be.true
        })

        // Verify the ability to fund the subscription
        it("should fund subscription successfully", async () => {
            const fundingAmount = ethers.parseEther("1")
            const tx = await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, fundingAmount)
            const receipt = await tx.wait(1)
            expect(receipt.status).to.equal(1) // Ensure the transaction was successful
        })

        // Verify if the subscription balance is greater than zero
        it("should check if subscription is funded", async () => {
            const subscription = await vrfCoordinatorV2Mock.getSubscription(subscriptionId)
            expect(subscription.balance).to.be.gt(0)
        })

        // Verify the deployed Raffle contract address
        it("should deploy raffle contract correctly", async () => {
            const raffleAddress = raffle.target
            const isValidAddress = ethers.isAddress(raffleAddress)
            expect(isValidAddress).to.be.true
        })

        // Verify if a consumer can be added to the subscription
        it("should add consumer to subscription", async () => {
            const tx = await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.target)
            await tx.wait(1)
            const isConsumer = await vrfCoordinatorV2Mock.consumerIsAdded(
                subscriptionId,
                raffle.target,
            )
            expect(isConsumer).to.be.true
        })

        it("should fail to fund invalid subscription", async () => {
            const invalidSubscriptionId = 999999
            try {
                await vrfCoordinatorV2Mock.fundSubscription(
                    invalidSubscriptionId,
                    ethers.parseEther("1"),
                )
                expect.fail("Transaction did not revert") // force failure if it doesn't revert
            } catch (error) {
                expect(error.message).to.include("InvalidSubscription()")
            }
        })

        // Negative test case: Attempting to check an invalid consumer
        it("should fail to check for a non-existent consumer", async () => {
            const nonExistentConsumerAddress = "0x0000000000000000000000000000000000000000"
            const isConsumer = await vrfCoordinatorV2Mock.consumerIsAdded(
                subscriptionId,
                nonExistentConsumerAddress,
            )
            expect(isConsumer).to.be.false
        })
    })
    describe("Raffle Functions Tests", function () {
        beforeEach(async () => {
            //add 3 players from hardhat accounts
            const accounts = await ethers.getSigners()
            const player1 = accounts[1]
            const player2 = accounts[2]
            const player3 = accounts[3]
            await raffle.enterRaffle({ value: ethers.parseEther("0.01") })
            await raffle.connect(player1).enterRaffle({ value: ethers.parseEther("0.01") })
            await raffle.connect(player2).enterRaffle({ value: ethers.parseEther("0.01") })
            await raffle.connect(player3).enterRaffle({ value: ethers.parseEther("0.01") })
            playersAddress = await raffle.getPlayers()
        })
        let entranceValue
        // Verify the entrace value of the getEntranceValue() function
        it("should return correct entrance value", async () => {
            const EntranceValue = await raffle.getEntranceValue()
            const chainId = network.config.chainId
            entranceValue = networkConfig[chainId]["entranceValue"]
            expect(EntranceValue).to.equal(entranceValue)
        })
        // Verify the interval value of the getInterval() function
        it("should allow entering the raffle with enough ETH", async () => {
            const additionalAmount = ethers.parseEther("0.01")
            const totalAmount = entranceValue + additionalAmount
            try {
                const tx = await raffle.enterRaffle({ value: totalAmount })
                await tx.wait()
                const player = await raffle.s_players(0)
                expect(player).to.equal(deployer)
            } catch (error) {
                expect.fail(error.message)
            }
        })
        // Verify the interval value of the getInterval() function
        it("should NOT allow entering the raffle with insufficient ETH", async () => {
            const insufficientAmount = entranceValue - ethers.parseEther("0.001") // slightly less than needed

            try {
                await raffle.enterRaffle({ value: insufficientAmount })
                expect.fail("Transaction succeeded when it should have reverted!")
            } catch (error) {
                // Check that error message includes 'NotEnoughETH' (your custom error)
                expect(error.message).to.include("NotEnoughETH")
            }
        })
        it("should request and receive random number", async () => {
            // Request random words
            const tx = await raffle.requestRandomWords()
            await tx.wait()
            const requestId = await raffle.s_requestId()

            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.target)

            // Read back the random words stored
            const winnerAddress = await raffle.getWinnerAddress()

            // Check that the winner is one of the players
            expect(playersAddress).to.include(winnerAddress)
        })
    })
})
