const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("mockCoordinator", (m) => {
    const mockCoordinator = m.contract("VRFCoordinatorV2_5Mock", [
        BigInt("100000000000000000"),
        1000000000,
        BigInt("1000000000000000000"),
    ])

    m.call(mockCoordinator, "launch", [])

    return { mockCoordinator }
})
