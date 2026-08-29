const hre = require("hardhat");

async function main() {
  const [landlord, tenant, arbitrator] = await hre.ethers.getSigners();

  const RentContract = await hre.ethers.getContractFactory("RentContract");

  const contract = await RentContract.deploy(
    tenant.address,
    arbitrator.address,
    hre.ethers.parseEther("0.5"),
    hre.ethers.parseEther("1"),
    12
  );

  await contract.waitForDeployment();

  console.log("1) Contract created");

  await contract.connect(tenant).lockDeposit({
    value: hre.ethers.parseEther("1"),
  });
  console.log("2) Tenant locked deposit");

  await contract.connect(tenant).payRent({
    value: hre.ethers.parseEther("0.5"),
  });
  console.log("3) Tenant paid one month rent");

  await contract.connect(landlord).raiseDispute();
  console.log("4) Landlord raised dispute");

  await contract.connect(arbitrator).resolveDispute(hre.ethers.parseEther("0.3"));
  console.log("5) Arbitrator resolved: 0.3 ETH to landlord, rest to tenant");

  const balance = await hre.ethers.provider.getBalance(await contract.getAddress());
  console.log("6) Remaining contract balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});