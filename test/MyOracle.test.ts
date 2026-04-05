// 导入语句
import { expect } from "chai";
import { network } from "hardhat";

// 连接网络（Hardhat 3新方式）
const { ethers, networkHelpers } = await network.connect();

// 定义Fixture函数
async function deployMyOracleFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const myOracle = await ethers.deployContract("MyOracle", [1000000e6]);
  
  return { myOracle, owner, addr1, addr2 };
}

// 测试套件
describe("MyOracle", function () {
  // 测试用例
  it("Should deploy with initial ", async function () {
    const { myOracle, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyOracleFixture);

    console.log("name ",await myOracle.getPrice())
    
    expect(await myOracle.getPrice()).to.equal(1000000e6);
  });

    // 测试用例
  it("latestRoundData", async function () {
    const { myOracle, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyOracleFixture);

    console.log("latestRoundData",await myOracle.latestRoundData())
    
  });

});