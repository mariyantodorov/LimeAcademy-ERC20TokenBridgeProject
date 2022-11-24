import { onAttemptToApprove } from "./approve"
import hre, { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(
        hre.config.networks.localhost.url //"http://127.0.0.1:8545/"
    )

    const amount = 1
    //user from the named account is a string address => cannot be a signer because is treated as a VoidSigner
    const { deployer, user } = await getNamedAccounts()
    const [, signer] = await ethers.getSigners()
    console.log("User address ", user)
    console.log("Signer address ", signer.address)

    const bridgeContract = await ethers.getContract("Bridge", deployer)
    const tokenContract = await ethers.getContract("ERC20Token", deployer)

    const transactionResponse = await tokenContract.mint(user, amount)
    await transactionResponse.wait()

    console.log(
        "User balance before lock:",
        (await tokenContract.balanceOf(user)).toString()
    )
    console.log(
        "Bridge balance before lock:",
        (await tokenContract.balanceOf(bridgeContract.address)).toString()
    )

    const signature = await onAttemptToApprove(
        signer.address,
        bridgeContract.address,
        tokenContract,
        provider,
        amount
    )

    console.log("Prepared the permit signature")

    console.log("Sending lockWithPermit tx")
    await bridgeContract
        .connect(signer)
        .lockWithPermit(
            tokenContract.address,
            1337,
            amount,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
        )
    console.log(
        "User balance after lock:",
        (await tokenContract.balanceOf(user)).toString()
    )
    console.log(
        "Bridge balance after lock:",
        (await tokenContract.balanceOf(bridgeContract.address)).toString()
    )

    // console.log("Sending release tx")
    // const tx = await bridgeContract
    //     .connect(signer)
    //     .release(tokenContract.address, amount)
    // await tx.wait()

    // console.log(
    //     "User balance after release:",
    //     (await tokenContract.balanceOf(user)).toString()
    // )
    // console.log(
    //     "Bridge balance after release:",
    //     (await tokenContract.balanceOf(bridgeContract.address)).toString()
    // )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
