module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock");

  // Create a new subscription
  const tx = await vrfCoordinatorMock.createSubscription();
  const txReceipt = await tx.wait(1);
  const subscriptionId = txReceipt.events[0].args.subId;

  // Fund it with some LINK (mock LINK)
  await vrfCoordinatorMock.fundSubscription(
    subscriptionId,
    ethers.utils.parseEther("10")
  );

  const keyHash = ethers.constants.HashZero;

  const lottery = await deploy("Raffle", {
    from: deployer,
    args: [subscriptionId, vrfCoordinatorMock.address, keyHash],
    log: true,
  });

  // Add Lottery contract as consumer
  await vrfCoordinatorMock.addConsumer(subscriptionId, lottery.address);

  log("✅ Lottery deployed at:", lottery.address);
};

module.exports.tags = ["all", "lottery"];
