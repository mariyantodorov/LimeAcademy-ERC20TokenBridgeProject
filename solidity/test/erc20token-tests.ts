import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("ERC20Token", function () {
    async function deployERC20TokenFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user] = await ethers.getSigners()

        const ERC20Token = await ethers.getContractFactory("ERC20Token")
        const erc20token = await ERC20Token.deploy("Test", "tst", owner.address)

        return { owner, user, erc20token }
    }

    describe("Tests", function () {
        it("Should deploy and transfer ownership", async () => {
            const { owner, erc20token } = await loadFixture(
                deployERC20TokenFixture
            )
            expect(await erc20token.owner()).to.equal(owner.address)
        })

        it("Should mint", async () => {
            const { owner, user, erc20token } = await loadFixture(
                deployERC20TokenFixture
            )
            const amount: number = 50
            await expect(() =>
                erc20token.connect(owner).mint(user.address, amount)
            ).to.changeTokenBalance(erc20token, user, amount)
        })

        it("Should not allow mint", async () => {
            const { user, erc20token } = await loadFixture(
                deployERC20TokenFixture
            )
            const amount: number = 50
            await expect(
                erc20token.connect(user).mint(user.address, amount)
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
})
