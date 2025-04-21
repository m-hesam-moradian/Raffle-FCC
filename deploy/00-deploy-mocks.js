module.exports = async ({ getNamedAccounts, deployments, network, ethers }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const BASE_FEE = ethers.utils.parseEther("0.25");
  const GAS_PRICE_LINK = 1e9;

  const vrfCoordinator = await deploy("VRFCoordinatorV2Mock", {
    from: deployer,
    log: true,
    args: [BASE_FEE, GAS_PRICE_LINK],
  });

  log("✅ VRFCoordinatorV2Mock Deployed at:", vrfCoordinator.address);
};

module.exports.tags = ["all", "mocks"];
