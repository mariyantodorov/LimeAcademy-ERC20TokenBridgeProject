module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const token = await deploy("ERC20Token", {
        from: deployer,
        args:["Test", "tst", deployer],
        log: true,
    })

    log("-----------------------------------")
}

module.exports.tags = ["all", "erc20token"]