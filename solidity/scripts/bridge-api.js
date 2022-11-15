const web3 = require('web3');
const bridge = require('../artifacts/contracts/Bridge.sol/Bridge.json');
let bridges = {};
let providers = {};
const sepoliaChainId = 11155111;
const bscChainId = 97;

//wss://sepolia.infura.io/ws/v3/199e48875a4f431e8ebaed6412865604
const web3Eth = new web3('https://sepolia.infura.io/v3/199e48875a4f431e8ebaed6412865604'); //RPC one?
const web3Bsc = new web3('https://data-seed-prebsc-1-s1.binance.org:8545');
providers[sepoliaChainId] = web3Eth;
providers[bscChainId] = web3Bsc;

const adminPrivKey = '8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc';
const { address: admin } = web3Bsc.eth.accounts.wallet.add(adminPrivKey);

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks[sepoliaChainId].address
);
bridges[sepoliaChainId] = bridgeEth;

const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  BridgeBsc.networks[bscChainId].address
);
bridges[bscChainId] = bridgeBsc;

bridgeEth.events.Transfer(
  {fromBlock: 0, step: 0}
)
.on('data', async event => handleTransferEvent(event));

bridgeBsc.events.Transfer(
    {fromBlock: 0, step: 0}
  )
  .on('data', async event => handleTransferEvent(event));

const handleTransferEvent = async(transferEvent) => {
    //, date, nonce
    const { from, to, targetChainId, amount } = transferEvent.returnValues;
    
    const tx = bridges[targetChainId].methods.mint(to, amount); //nounce
    const [gasPrice, gasCost] = await Promise.all([
      providers[targetChainId].eth.getGasPrice(),
      tx.estimateGas({from: admin}),
    ]);
    const data = tx.encodeABI();
    const txData = {
      from: admin,
      to: bridges[targetChainId].options.address,
      data,
      gas: gasCost,
      gasPrice
    };
    const receipt = await providers[targetChainId].eth.sendTransaction(txData);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`
      Processed transfer:
      - from ${from} 
      - to ${to} 
      - amount ${amount} tokens
      - date ${date}
    `);
  }
