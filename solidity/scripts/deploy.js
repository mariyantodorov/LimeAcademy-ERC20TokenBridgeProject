const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBridgeContract() {
    await hre.run("compile"); //compile the contract using a subtask
    const [deployer] = await ethers.getSigners(); //get the deployer

    await hre.run("printInfo", { deployer: deployer.address, balance: (await deployer.getBalance()).toString()});
    
    const BridgeFactory = await ethers.getContractFactory("BridgeFactory");
    const bridge = await BridgeFactory.deploy();
  
    await bridge.deployed();
  
    await hre.run("print", { message: `Done! Bridge deployed to ${bridge.address}` });

    if(hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
        await hre.run("verify:verify", {
            address: bridge.address
        })
    }
}
  
module.exports = deployBridgeContract;