task("deploy-mainnet", "Deploys contract on a provided network")
  .addParam(
    "privateKey",
    "Please provide the private key"
  )
  .setAction(async({privateKey}) => {    
    const deployBridgeContract = require("../scripts/deploy-with-param");
    await deployBridgeContract(privateKey);
  });

module.exports = task;
