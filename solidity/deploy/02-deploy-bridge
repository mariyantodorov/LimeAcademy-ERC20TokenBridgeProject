module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const wrappedTokenFactory = await deployments.get("WrappedTokenFactory")

    const bridge = await deploy("Bridge", {
        from: deployer,
        args:[wrappedTokenFactory.address],
        log: true,
    })

    log("-----------------------------------")
}

module.exports.tags = ["all", "bridge"]