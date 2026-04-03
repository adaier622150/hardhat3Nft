// 导入语句
import { expect } from "chai";
import { network } from "hardhat";

// 连接网络（Hardhat 3新方式）
const { ethers, networkHelpers } = await network.connect();
const name = "MyERC";
const symbol = "ERC";
const decimals_ = 6;
const initialSupply = 1000000e6;
// 定义Fixture函数
async function deployMyERC20Fixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const myERC20 = await ethers.deployContract("MyERC20", [name,symbol,decimals_,initialSupply]);
  
  return { myERC20, owner, addr1, addr2 };
}

// 测试套件
describe("MyERC20", function () {
  // 测试用例
  it("Should deploy with initial ", async function () {
    const { myERC20, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyERC20Fixture);
    
    console.log("name ",await myERC20.name())
    console.log("symbol ",await myERC20.symbol())
    console.log("decimals ",await myERC20.decimals())
    console.log("natotalSupplyme ",await myERC20.totalSupply())
    expect(await myERC20.name()).to.equal(name);
    expect(await myERC20.symbol()).to.equal(symbol);
    expect(await myERC20.decimals()).to.equal(decimals_);
    expect(await myERC20.totalSupply()).to.equal(initialSupply);
    
  });

  // 测试用例
  it("Should return correct balance ", async function () {
    const { myERC20, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyERC20Fixture);
    await myERC20.mint(addr1,100n);
    const  balanceOwner = await myERC20.balanceOf(owner);
    const  balance = await myERC20.balanceOf(addr1);
    console.log("balanceOwner ", balanceOwner);
    console.log("balance ", balance);
    expect(balance).to.equal(100n);
  });
});