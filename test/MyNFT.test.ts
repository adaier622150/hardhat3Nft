// 导入语句
import { expect } from "chai";
import { network } from "hardhat";

// 连接网络（Hardhat 3新方式）
const { ethers, networkHelpers } = await network.connect();
const name = "MyNFT";
const symbol = "NFT";

// 定义Fixture函数
async function deployMyNFTFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const myNFT = await ethers.deployContract("MyNFT", [name,symbol]);
  
  return { myNFT, owner, addr1, addr2 };
}

// 测试套件
describe("MyNFT", function () {
  // 测试用例
  it("Should deploy with initial ", async function () {
    const { myNFT, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyNFTFixture);
    
    console.log("name ",await myNFT.name())
    console.log("symbol ",await myNFT.symbol())
    
    expect(await myNFT.name()).to.equal(name);
    expect(await myNFT.symbol()).to.equal(symbol);
  });

  // 测试用例
  it("Should return  tokenId and  balance ", async function () {
    const { myNFT, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyNFTFixture);
    
    await myNFT.mintNext(owner);
    const  tokenId = await myNFT.nextId();
    const  balance = await myNFT.balanceOf(owner);
    console.log("tokenId ", tokenId);
    console.log("balance ", balance);

    expect(tokenId).to.equal(2);
    expect(balance).to.equal(1);
  });

  
  // 测试用例
  it("Should mint ", async function () {
    const { myNFT, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyNFTFixture);
    const tokenId = 1n;
    await myNFT.mint(owner,tokenId);

    const user = await myNFT.ownerOf(tokenId);
    console.log("user ", user);
    console.log("owner ", owner);
    expect(user).to.equal(owner);
  });
});