import Bridge from "../../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20 from "../../artifacts/contracts/ERC20Token.sol/ERC20Token.json"

const Web3 = require("web3")
let bridges = new Map<number, any>()
let providers = new Map<number, any>()
const chainIdA = 31337 //11155111 //sepolia
const chainIdB = 1337 //97 //Bsc
const adminPrivKey =
    "8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc"
const bridgeContractAddressChainA = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const bridgeContractAddressChainB = "0xfA2f40104aBb08E89B762FDac5a16D03372b14c3"

const providerChainA = new Web3("http://127.0.0.1:8545/")
providers.set(chainIdA, providerChainA)

const providerChainB = new Web3("HTTP://127.0.0.1:7545")
providers.set(chainIdB, providerChainB)

const bridgeContractChainA = new providerChainA.eth.Contract(
    Bridge.abi,
    bridgeContractAddressChainA
)
bridges.set(chainIdA, bridgeContractChainA)

const bridgeContractChainB = new providerChainB.eth.Contract(
    Bridge.abi,
    bridgeContractAddressChainB
)
bridges.set(chainIdB, bridgeContractChainB)

async function main() {
    console.log("start")
    bridgeContractChainA.events
        .Lock({ fromBlock: 0, step: 0 })
        .on("data", async (event: any) => handleLockEvent(event))
    console.log("end")
    //providerChainA.on(bridgeContractChainA.filters.Lock(), handleLockEvent)
}

const handleLockEvent = async (lockEvent: any) => {
    //date?
    const { from, tokenAddress, targetChainId, amount } = lockEvent.returnValues

    const tokenContract = new Web3.eth.Contract(ERC20.abi, tokenAddress)
    const tokenName = await tokenContract.methods.name().call()
    const tokenSymbol = await tokenContract.methods.symbol().call()
    //call bridgeB if from can claim
    const targetBridgeContract = bridges.get(targetChainId)
    const tx = await targetBridgeContract?.methods.setClaimable(
        from,
        tokenAddress,
        amount
    )
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
