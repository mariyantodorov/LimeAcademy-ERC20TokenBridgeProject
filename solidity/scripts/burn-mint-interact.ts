import ERC20Token from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json"
import { onAttemptToApprove } from "./approve"
import hre, { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(
        hre.config.networks.localhost.url //"http://127.0.0.1:8545/"
    )

    const amount = 1
    const { deployer } = await getNamedAccounts()
    const [Deployer, signer] = await ethers.getSigners()

    const bridgeContract = await ethers.getContract("Bridge", deployer)
    const wrappedTokenFactory = await ethers.getContract(
        "WrappedTokenFactory",
        deployer
    )

    //Initialize wrapped token
    const txResponse = await wrappedTokenFactory
        .connect(Deployer)
        .createToken("Test", "tst", Deployer.address)
    const txReceipt = await txResponse.wait()
    //get token created event and check token address
    const createTokenEvent = txReceipt.events.filter(
        (evt: any) => evt.event == "TokenCreated"
    )[0]
    const wrappedTokenAddress = createTokenEvent.args.tokenAddress

    const wrappedTokenContract = new ethers.Contract(
        wrappedTokenAddress,
        ERC20Token.abi,
        provider
    )

    //deployer/admin mints initial balance of the token to the user
    const transactionResponse = await wrappedTokenContract
        .connect(Deployer)
        .mint(signer.address, amount)
    await transactionResponse.wait()

    console.log(
        "User balance before burn:",
        (await wrappedTokenContract.balanceOf(signer.address)).toString()
    )

    const signature = await onAttemptToApprove(
        signer.address,
        bridgeContract.address,
        wrappedTokenContract,
        provider,
        amount
    )

    console.log("Prepared the permit signature")

    console.log("Sending burnWithPermit tx")
    const txBurn = await bridgeContract
        .connect(signer)
        .burnWithPermit(
            wrappedTokenContract.address,
            1337,
            amount,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
        )
    const txBurnReceipt = await txBurn.wait()
    console.log(
        "User balance after burn:",
        (await wrappedTokenContract.balanceOf(signer.address)).toString()
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
