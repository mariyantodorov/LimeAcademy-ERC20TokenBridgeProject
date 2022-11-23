import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployERC20Token = async function () {
    //@ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const token = await deploy("ERC20Token", {
        from: deployer,
        args: ["Test", "tst", deployer],
        log: true,
    })

    log("-----------------------------------")
}

export default deployERC20Token
deployERC20Token.tags = ["all", "erc20token"]
