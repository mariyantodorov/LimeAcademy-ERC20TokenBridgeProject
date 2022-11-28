import { JsonRpcProvider } from "@ethersproject/providers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { onAttemptToApprove } from "../scripts/approve"
import { Contract, Wallet } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import ERC20TokenABi from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json"

describe("Bridge", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployBridgeFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user]: SignerWithAddress[] = await ethers.getSigners()

        const WrappedTokenFactory = await ethers.getContractFactory(
            "WrappedTokenFactory"
        )
        const wrappedTokenFactory: Contract = await WrappedTokenFactory.deploy()

        const BridgeFactory = await ethers.getContractFactory("Bridge")
        const bridge: Contract = await BridgeFactory.deploy(
            wrappedTokenFactory.address
        )

        const ERC20Token = await ethers.getContractFactory("ERC20Token")
        const erc20token: Contract = await ERC20Token.deploy(
            "Test",
            "tst",
            owner.address
        )

        //TODO: mock provider????
        const provider: JsonRpcProvider = new JsonRpcProvider(
            "http://localhost:8545"
        )

        return {
            owner,
            user,
            bridge,
            wrappedTokenFactory,
            erc20token,
            provider,
        }
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { bridge, owner } = await loadFixture(deployBridgeFixture)

            expect(await bridge.owner()).to.equal(owner.address)
        })
    })

    describe("Functions", function () {
        describe("LockWithPermit", function () {
            it("Should not allow lock 0 amount", async () => {
                const { bridge, user, erc20token, provider } =
                    await loadFixture(deployBridgeFixture)
                const targetChainId: number = 31337
                const amount: number = 0
                const signature = await onAttemptToApprove(
                    user.address,
                    bridge.address,
                    erc20token,
                    provider,
                    amount
                )

                await expect(
                    bridge.lockWithPermit(
                        erc20token.address,
                        targetChainId,
                        amount,
                        signature.deadline,
                        signature.v,
                        signature.r,
                        signature.s
                    )
                ).to.be.revertedWith("amount < 1")
            })

            it("Should lock non-wrapped token with permit", async () => {
                const { bridge, owner, user, erc20token, provider } =
                    await loadFixture(deployBridgeFixture)
                const targetChainId: number = 31337
                const amount: number = 1
                const signature = await onAttemptToApprove(
                    user.address,
                    bridge.address,
                    erc20token,
                    provider,
                    amount
                )

                await erc20token.connect(owner).mint(user.address, amount)

                await expect(
                    bridge
                        .connect(user)
                        .lockWithPermit(
                            erc20token.address,
                            targetChainId,
                            amount,
                            signature.deadline,
                            signature.v,
                            signature.r,
                            signature.s
                        )
                )
                    .to.emit(erc20token, "Transfer")
                    .withArgs(user.address, bridge.address, amount)
            })

            // it("Should lock wrapped token with permit", async () => {
            //     const { bridge, owner, user, wrappedTokenFactory, provider } =
            //         await loadFixture(deployBridgeFixture)
            //     const targetChainId: number = 31337
            //     const amount: number = 1
            //     const createTokenTx = await wrappedTokenFactory
            //         .connect(owner)
            //         .createToken("Test2", "tst2")
            //     const receipt = await createTokenTx.wait()
            //     const wrappedtokenAddress = receipt.events.filter(
            //         (e: { event: string }) => e.event == "TokenCreated"
            //     )[0].args.tokenAddress

            //     const wrappedtokenContract = new ethers.Contract(
            //         wrappedtokenAddress,
            //         ERC20TokenABi.abi,
            //         provider
            //     )
            //     await wrappedtokenContract
            //         .connect(owner)
            //         .mint(user.address, amount)

            //     const signature = await onAttemptToApprove(
            //         user.address,
            //         bridge.address,
            //         wrappedtokenContract,
            //         provider,
            //         amount
            //     )

            //     await expect(
            //         bridge
            //             .connect(user)
            //             .lockWithPermit(
            //                 wrappedtokenContract.address,
            //                 targetChainId,
            //                 amount,
            //                 signature.deadline,
            //                 signature.v,
            //                 signature.r,
            //                 signature.s
            //             )
            //     )
            //         .to.emit(wrappedtokenContract, "Transfer")
            //         .withArgs(
            //             user.address,
            //             "0x0000000000000000000000000000000000000000",
            //             amount
            //         )
            // })

            it("Should not allow lock token with invalid permit", async () => {
                const { bridge, user, erc20token, provider } =
                    await loadFixture(deployBridgeFixture)
                const targetChainId: number = 31337
                const amount: number = 1
                const signature = await onAttemptToApprove(
                    user.address,
                    bridge.address,
                    erc20token,
                    provider,
                    amount
                )

                await expect(
                    bridge
                        .connect(user)
                        .lockWithPermit(
                            erc20token.address,
                            targetChainId,
                            amount * 2,
                            signature.deadline,
                            signature.v,
                            signature.r,
                            signature.s
                        )
                ).to.be.revertedWith("ERC20Permit: invalid signature")
            })

            it("Should emit a Lock event", async function () {
                const { bridge, owner, user, erc20token, provider } =
                    await loadFixture(deployBridgeFixture)

                const targetChainId: number = 31337
                const amount: number = 1
                const signature = await onAttemptToApprove(
                    user.address,
                    bridge.address,
                    erc20token,
                    provider,
                    amount
                )

                erc20token.connect(owner).mint(user.address, amount)

                await expect(
                    bridge
                        .connect(user)
                        .lockWithPermit(
                            erc20token.address,
                            targetChainId,
                            amount,
                            signature.deadline,
                            signature.v,
                            signature.r,
                            signature.s
                        )
                )
                    .to.emit(bridge, "Lock")
                    .withArgs(
                        user.address,
                        erc20token.address,
                        targetChainId,
                        amount
                    )
            })
        })

        describe("Release", function () {})
    })
})
