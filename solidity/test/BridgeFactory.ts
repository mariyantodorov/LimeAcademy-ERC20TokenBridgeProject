import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BridgeFactory", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBridgeFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Bridge = await ethers.getContractFactory("BridgeFactory");
    const bridge = await Bridge.deploy();

    return { owner, otherAccount, bridge };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { bridge, owner } = await loadFixture(deployBridgeFixture);

      expect(await bridge.owner()).to.equal(owner.address);
    });
  });

  describe("Funcitons", function () {
    describe("Validations", function () {});

    describe("Events", function () {});

    describe("Transfers", function () {});
  });
});
