task("deploy-testnets", "Deploys contract on a provided network")
.setAction(async () => {
    const deployBridgeContract = require("../scripts/deploy");
    await deployBridgeContract();
});

module.exports = task;