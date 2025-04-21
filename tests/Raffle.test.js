const { deployments, ethers } = require("hardhat");
const { expect } = require("chai");

describe("Lottery with VRF Mock", function () {
  let lottery, vrfMock;

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    lottery = await ethers.getContract("Raffle");
    vrfMock = await ethers.getContract("VRFCoordinatorV2Mock");
  });

  it("should request and receive a random number", async () => {
    const tx = await lottery.requestRandomNumber();
    await tx.wait(1);
    const requestId = await lottery.requestId();

    await vrfMock.fulfillRandomWords(requestId, lottery.address);

    const random = await lottery.randomResult();
    expect(random).to.not.equal(0);
  });
});
