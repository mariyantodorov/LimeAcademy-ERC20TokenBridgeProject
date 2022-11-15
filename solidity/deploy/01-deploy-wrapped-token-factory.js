module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const wrappedTokenFactory = await deploy("WrappedTokenFactory", {
        from: deployer,
        args:[],
        log: true,
    })

    log("-----------------------------------")
}

module.exports.tags = ["all", "wTokenFactory"]