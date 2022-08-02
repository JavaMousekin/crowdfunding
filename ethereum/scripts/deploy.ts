import { ethers } from "hardhat";

async function main() {
  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const contract = await Crowdfunding.deploy();

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
