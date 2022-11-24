import { ethers } from "ethers"
import hre from "hardhat"
import { JsonRpcProvider } from "@ethersproject/providers"
import { Contract } from "@ethersproject/contracts"
import Bridge from "../../artifacts/contracts/Bridge.sol/Bridge.json"

let bridges = new Map<number, Contract>()
let providers = new Map<number, JsonRpcProvider>()
const chainIdA = 11155111 //sepolia
const chainIdB = 97 //Bsc

//wss://sepolia.infura.io/ws/v3/199e48875a4f431e8ebaed6412865604
const providerChainA = new hre.ethers.providers.JsonRpcProvider(
    "https://sepolia.infura.io/v3/199e48875a4f431e8ebaed6412865604"
) //RPC one?
const providerChainB = new hre.ethers.providers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
)
providers.set(chainIdA, providerChainA)
providers.set(chainIdB, providerChainB)

const adminPrivKey =
    "8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc"
const bridgeContractAddressChainA = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const bridgeContractAddressChainB = ""

const bridgeContractChainA: Contract = new hre.ethers.Contract(
    bridgeContractAddressChainA,
    Bridge.abi,
    providerChainA
)
bridges.set(chainIdA, bridgeContractChainA)

const bridgeContractChainB: Contract = new hre.ethers.Contract(
    bridgeContractAddressChainB,
    Bridge.abi,
    providerChainB
)
bridges.set(chainIdA, bridgeContractChainA)

async function main() {
    // bridgeEth.events.Lock(
    //   {fromBlock: 0, step: 0}
    // )
    // .on('data', async event => handleLockEvent(event));
    providerChainA.on(bridgeContractChainA.filters.Lock(), handleLockEvent)
}

const handleLockEvent = async (lockEvent: any) => {
    //date?
    const { from, to, targetChainId, amount } = lockEvent.returnValues

    //call bridgeB if from can claim
    const targetBridgeContract = bridges.get(targetChainId)
    const tx = await targetBridgeContract?.methods.release(to, amount)
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
      - to ${to} 
      - amount ${amount} tokens
    `)
}

main()
