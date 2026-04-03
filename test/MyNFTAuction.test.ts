// 导入语句
import { expect } from "chai";
import { network } from "hardhat";

// 连接网络（Hardhat 3新方式）
const { ethers, networkHelpers } = await network.connect();
const name = "MyNFT";
const symbol = "NFT";

// 定义Fixture函数
async function deployMyNFTAuctionFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const myNFTAuction = await ethers.deployContract("MyNFTAuction");

  const initData = myNFTAuction.interface.encodeFunctionData("initialize", [owner.address]);
  const auctionAddress = await myNFTAuction.getAddress();
 
  const proxy = await ethers.deployContract("TransparentUpgradeableProxy",
    [auctionAddress,owner.address,initData]);

    // console.log("myNFTAuction ",await myNFTAuction.getAddress())
    // console.log("proxy ", await proxy.getAddress())
    // console.log("myNFTAuction owner ",await myNFTAuction.owner())
    // console.log("owner ",await owner.getAddress())
    // console.log("addr1 ",await addr1.getAddress())
    // console.log("addr2 ",await addr2.getAddress())

  return { myNFTAuction,proxy, owner, addr1, addr2 };
}

// 测试套件
describe("MyNFTAuction", function () {
  // 测试用例
  it("getVersion", async function () {
    const { myNFTAuction,proxy, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyNFTAuctionFixture);

    console.log("proxy Address ",await proxy.getAddress())
    const auction = myNFTAuction.attach(await proxy.getAddress());
    
    console.log("Address ",await auction.getAddress())
    console.log("getVersion1 ",await auction.getVersion())
    expect(await auction.connect(addr1).getVersion()).to.equal("MyNFTAuction V1");
  });


    // 测试用例
  it("upgradeToV2", async function () {
    const { myNFTAuction,proxy, owner, addr1, addr2 } = await networkHelpers.loadFixture(deployMyNFTAuctionFixture);

    console.log("proxy Address ",await proxy.getAddress())
    const myNFTAuctionV2 = await ethers.deployContract("MyNFTAuction_V2");
    const auction = myNFTAuction.attach(await proxy.getAddress());
    console.log("Address ",await auction.getAddress())
    console.log("getVersion1 ",await auction.getVersion())

    await auction.connect(owner).upgradeToAndCall(await myNFTAuctionV2.getAddress(),"0x");

    console.log("Address ",await auction.getAddress())
    console.log("getVersion2 ",await auction.getVersion())
    expect(await auction.connect(addr1).getVersion()).to.equal("MyNFTAuction V2");
  });


});