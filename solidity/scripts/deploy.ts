import hre, { ethers } from "hardhat";

async function main() {
  await hre.run("compile");
  // const [deployer] = await ethers.getSigners();

  // await hre.run("printInfo", {
  //   deployer: deployer.address,
  //   balance: (await deployer.getBalance()).toString(),
  // });

  const BridgeFactory = await ethers.getContractFactory("BridgeFactory");
  const bridge = await BridgeFactory.deploy();

  await bridge.deployed();

  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    await hre.run("verify:verify", {
      address: bridge.address,
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
