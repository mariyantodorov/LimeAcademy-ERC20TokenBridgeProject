const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBridgeContract(_privateKey) {
  await run("compile"); //compile the contract using a subtask
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); //New wallet with the privateKey passed from CLI as param

  await hre.run("printInfo", { deployer: wallet.address, balance: (await wallet.getBalance()).toString()});

  const BridgeFactory = await ethers.getContractFactory("BridgeFactory"); //// Get the contract factory with the signer from the wallet created
  const bridge = await BridgeFactory.deploy();

  await bridge.deployed();

  await run("print", { message: `Done! Bridge deployed to ${bridge.address}` });

  if(hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
    await hre.run("verify:verify", {
        address: bridge.address
    })
  }
}

module.exports = deployBridgeContract;
