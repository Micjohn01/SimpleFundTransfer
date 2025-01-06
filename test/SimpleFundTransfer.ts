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


 });
