import { ethers } from "hardhat";
import { expect } from "chai";

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


 });
