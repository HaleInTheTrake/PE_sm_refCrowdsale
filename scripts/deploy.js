const hre = require("hardhat");
const ethers = hre.ethers


async function main() {
  // sale param
  //10 ** 6 * 10 ** 18
  const total_supply = ethers.utils.parseUnits("1000000.0", 18)
  // 1 EHT = 1000 $ && 1 token = 5 USD --> 1 USD = 10 ^ 15 wei && 1 token = 5 * 10 ^ 15 wei
  const rate = 200

  const [owner] = await ethers.getSigners()
    
  const SWGToken = await ethers.getContractFactory("SWGToken", owner)
  const token = await SWGToken.deploy(total_supply)
  await token.deployed()

  const MyCrowdsale = await ethers.getContractFactory("Crowdsale", owner)
  const crowdsale = await MyCrowdsale.deploy(rate, owner.address, token.address)
  await crowdsale.deployed()

  console.log(owner.address)
  console.log(token.address)
  console.log(crowdsale.address)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
