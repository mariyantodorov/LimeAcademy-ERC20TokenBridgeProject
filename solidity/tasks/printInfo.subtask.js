subtask("printInfo", "Prints valuable info after deployment.")
  .addParam("deployer", "Address of deployer of the contract")
  .addParam("balance", "Balance of deployer the contract")
  .setAction(async (taskArgs) => {
    console.log("Deploying contract with the account:", taskArgs.deployer);
    console.log("Account balance:", taskArgs.balance);
    console.log("Waiting for deployment...");
  });

module.exports = subtask;