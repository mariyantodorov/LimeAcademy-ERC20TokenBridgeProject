import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployBridge = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const wrappedTokenFactory = await deployments.get("WrappedTokenFactory")

    const bridge = await deploy("Bridge", {
        from: deployer,
        args: [wrappedTokenFactory.address],
        log: true,
        //waitConfirmations:
    })

    const wrappedTokenFactoryContract = await ethers.getContract(
        "WrappedTokenFactory",
        deployer
    )
    await wrappedTokenFactoryContract.transferOwnership(bridge.address)

    log("-----------------------------------")
}

export default deployBridge
deployBridge.tags = ["all", "bridge"]
