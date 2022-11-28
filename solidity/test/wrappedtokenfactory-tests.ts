import { ethers } from "hardhat"
import { ContractFactory } from "ethers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

describe("WrappedTokenFactory", function () {
    async function deployWrappedTokenFactoryFixture() {
        const [owner, user] = await ethers.getSigners()

        const WrappedTokenFactory = await ethers.getContractFactory(
            "WrappedTokenFactory"
        )
        const wrappedTokenFactory = await WrappedTokenFactory.deploy()

        return { owner, user, wrappedTokenFactory }
    }

    it("Should create new token and return it's address", async function () {
        const { wrappedTokenFactory } = await loadFixture(
            deployWrappedTokenFactoryFixture
        )
        const createTokenTx = await wrappedTokenFactory.createToken(
            "Test",
            "TST"
        )
        const receipt = await createTokenTx.wait()
        const address = receipt.events.filter(
            (e: { event: string }) => e.event == "TokenCreated"
        )[0].args.tokenAddress

        expect(await wrappedTokenFactory.getToken(address)).to.be.properAddress
    })

    it("Should not allow create", async () => {
        const { user, wrappedTokenFactory } = await loadFixture(
            deployWrappedTokenFactoryFixture
        )

        await expect(
            wrappedTokenFactory.connect(user).createToken("Test", "TST")
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should return zero address when token is not created from factory", async () => {
        const { owner, wrappedTokenFactory } = await loadFixture(
            deployWrappedTokenFactoryFixture
        )

        const tokenFactory: ContractFactory = await ethers.getContractFactory(
            "ERC20Token"
        )
        const regularERC20 = await tokenFactory.deploy(
            "Test",
            "TST",
            owner.address
        )

        expect(
            await wrappedTokenFactory.getToken(regularERC20.address)
        ).to.equal(ethers.constants.AddressZero)
    })
})
