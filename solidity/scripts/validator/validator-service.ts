import { ethers } from "ethers"
import { Contract } from "@ethersproject/contracts"
import Bridge from "../../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20 from "../../artifacts/contracts/ERC20Token.sol/ERC20Token.json"

let bridges = new Map<number, Contract>()
let providers = new Map<number, any>()
const chainIdA = 31337 //11155111 //sepolia
const chainIdB = 1337 //97 //Bsc
const adminPrivKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const bridgeContractAddressChainA = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const bridgeContractAddressChainB = "0x200451aDaC07e80ff008151c67B894CA71580F61"

//"http://127.0.0.1:8545/"
const providerChainA = new ethers.providers.JsonRpcProvider()
providers.set(chainIdA, providerChainA)

const providerChainB = new ethers.providers.JsonRpcProvider(
    "HTTP://127.0.0.1:7545"
)
providers.set(chainIdB, providerChainB)

const bridgeContractChainA = new ethers.Contract(
    bridgeContractAddressChainA,
    Bridge.abi,
    providerChainA
)
bridges.set(chainIdA, bridgeContractChainA)

const bridgeContractChainB = new ethers.Contract(
    bridgeContractAddressChainB,
    Bridge.abi,
    providerChainB
)
bridges.set(chainIdB, bridgeContractChainB)

async function main() {
    bridgeContractChainA.on(
        "Lock",
        async (
            from: string,
            tokenAddress: string,
            targetChainId: number,
            amount: number,
            event: any
        ) =>
            handleLockEvent(
                from,
                tokenAddress,
                targetChainId,
                amount,
                event,
                providerChainA
            )
    )
}

const handleLockEvent = async (
    from: string,
    tokenAddress: string,
    targetChainId: number,
    amount: number,
    event: any,
    provider: any
) => {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20.abi, provider)
    const tokenName = await tokenContract.name()
    console.log(tokenName)
    const tokenSymbol = await tokenContract.symbol()
    console.log(tokenSymbol)

    //call bridgeB if from can claim
    const targetBridgeContract = bridges.get(targetChainId)
    const targetBridgeProvider = providers.get(targetChainId)
    const validatorWallet = new ethers.Wallet(
        "d4b0ee08ee826281a3ce2ebd5db6ee73f519551efb83de268602e13a5eb4c9ad", //ganache account[0] private key
        targetBridgeProvider
    )
    const tx = await targetBridgeContract
        ?.connect(validatorWallet) //target chain owner/relayer
        .setClaimable(from, tokenAddress, tokenName, tokenSymbol, amount)
    const txReceipt = await tx.wait()
    // const [gasPrice, gasCost] = await Promise.all([
    //     providers[targetChainId].eth.getGasPrice(),
    //     tx.estimateGas({ from: admin }),
    // ])
    // const data = tx.encodeABI()
    // const txData = {
    //     from: admin,
    //     to: bridges[targetChainId].options.address,
    //     data,
    //     gas: gasCost,
    //     gasPrice,
    // }
    // const receipt = await providers[targetChainId].eth.sendTransaction(txData)

    console.log(`Transaction hash: ${txReceipt.transactionHash}`)
    console.log(`
      Processed transfer:
      - from ${from} 
      - token ${tokenAddress} 
      - amount ${amount} tokens
    `)
}

main()
