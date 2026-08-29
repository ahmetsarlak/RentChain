const hre = require("hardhat");

async function main() {
  const [landlord, tenant, arbitrator] = await hre.ethers.getSigners();

  const RentContract = await hre.ethers.getContractFactory("RentContract");

  const monthlyRent = hre.ethers.parseEther("0.5");
  const deposit = hre.ethers.parseEther("1");
  const durationMonths = 12;

  const contract = await RentContract.deploy(
    tenant.address,
    arbitrator.address,
    monthlyRent,
    deposit,
    durationMonths
  );

  await contract.waitForDeployment();

  console.log("Landlord:", landlord.address);
  console.log("Tenant:", tenant.address);
  console.log("Arbitrator:", arbitrator.address);
  console.log("Contract Address:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});