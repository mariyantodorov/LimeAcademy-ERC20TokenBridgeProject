import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployWrappedTokenFactory = async function (
    hre: HardhatRuntimeEnvironment
) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const wrappedTokenFactory = await deploy("WrappedTokenFactory", {
        from: deployer,
        args: [],
        log: true,
    })

    log("-----------------------------------")
}

export default deployWrappedTokenFactory
deployWrappedTokenFactory.tags = ["all", "wTokenFactory"]
