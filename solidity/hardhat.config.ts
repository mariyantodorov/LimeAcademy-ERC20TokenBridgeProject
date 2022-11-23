import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-deploy"
import dotenv from "dotenv"

dotenv.config()
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY as string
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.17",
        settings: { optimizer: { enabled: true, runs: 200 } },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        ganache: {
            url: "HTTP://127.0.0.1:7545",
            chainId: 1337,
        },
        goerli: {
            url: SEPOLIA_RPC_URL,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 5,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}

export default config
