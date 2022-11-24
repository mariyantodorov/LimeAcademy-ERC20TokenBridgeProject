import { JsonRpcProvider } from "@ethersproject/providers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { onAttemptToApprove } from "../scripts/approve"
import { Contract, Wallet } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

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
                ).to.be.revertedWith("lock amount < 1")
            })

            //Should lock token with permit

            //Should not allow lock token with invalid permit
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

            //emits event
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

        describe("BurnWithPermit", function () {})

        describe("Release", function () {})

        describe("Mint", function () {})
    })
})
