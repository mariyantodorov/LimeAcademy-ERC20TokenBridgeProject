import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployBridge = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const wrappedTokenFactory = await deployments.get("WrappedTokenFactory")

    const bridge = await deploy("Bridge", {
        from: deployer,
        args: [wrappedTokenFactory.address],
        log: true,
    })

    log("-----------------------------------")
}

export default deployBridge
deployBridge.tags = ["all", "bridge"]
