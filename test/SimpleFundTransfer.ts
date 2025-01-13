import { ethers } from "hardhat";
import { expect } from "chai";
import { utils } from "ethers";

describe("SimpleFundTransfer Contract", function () {
  let SimpleFundTransfer: any;
  let contract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const SimpleFundTransferFactory = await ethers.getContractFactory("SimpleFundTransfer");
    contract = await SimpleFundTransferFactory.deploy();
    await contract.deployed();
  });

    it("Should set the correct owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should allow deposits and update the totalAmount", async function () {
    const depositAmount = utils.parseEther("1");
    await contract.connect(addr1).deposit({ value: depositAmount });

    expect(await contract.getBalance()).to.equal(depositAmount);
    expect(await contract.totalAmount()).to.equal(depositAmount);
  });

  it("Should allow the owner to withdraw", async function () {
    const depositAmount = utils.parseEther("2");
    const withdrawAmount = utils.parseEther("1");

    await contract.connect(addr1).deposit({ value: depositAmount });

    await expect(contract.connect(owner).withdrawAmount(withdrawAmount))
      .to.emit(contract, "Withdrawal")
      .withArgs(owner.address, withdrawAmount);

    expect(await contract.getBalance()).to.equal(depositAmount.sub(withdrawAmount));
    expect(await contract.totalAmount()).to.equal(depositAmount.sub(withdrawAmount));
  });

    it("Should prevent withdrawal beyond the limit", async function () {
    const depositAmount = utils.parseEther("1");
    const withdrawAmount = utils.parseEther("2");

    await contract.connect(addr1).deposit({ value: depositAmount });

    await expect(contract.connect(owner).withdrawAmount(withdrawAmount)).to.be.revertedWith("Insufficient funds");
  });

  it("Should allow the owner to transfer to a whitelisted address", async function () {
    const depositAmount = utils.parseEther("2");
    const transferAmount = utils.parseEther("1");

    await contract.connect(addr1).deposit({ value: depositAmount });

    await contract.connect(owner).addToWhitelist(addr2.address);
    await expect(contract.connect(owner).transferToWhitelisted(addr2.address, transferAmount))
      .to.emit(contract, "Transfer")
      .withArgs(owner.address, addr2.address, transferAmount);

    expect(await contract.totalAmount()).to.equal(depositAmount.sub(transferAmount));
  });

    it("Should prevent transfers to non-whitelisted addresses", async function () {
    const depositAmount = utils.parseEther("2");
    const transferAmount = utils.parseEther("1");

    await contract.connect(addr1).deposit({ value: depositAmount });

    await expect(contract.connect(owner).transferToWhitelisted(addr2.address, transferAmount)).to.be.revertedWith(
      "Address not whitelisted"
    );
  });

    it("Should allow the contract to be paused and resumed", async function () {
    await contract.connect(owner).pause();
    expect(await contract.isPaused()).to.be.true;

    await expect(contract.connect(addr1).deposit({ value: utils.parseEther("1") })).to.be.revertedWith(
      "Contract is paused"
    );

        await contract.connect(owner).resume();
    expect(await contract.isPaused()).to.be.false;

    await expect(contract.connect(addr1).deposit({ value: utils.parseEther("1") }))
      .to.emit(contract, "Deposit")
      .withArgs(addr1.address, utils.parseEther("1"));
  });



  });
