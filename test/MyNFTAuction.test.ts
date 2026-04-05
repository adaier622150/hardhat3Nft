// 导入语句
import { expect } from "chai";
import { network } from "hardhat";

// 连接网络（Hardhat 3新方式）
const { ethers, networkHelpers } = await network.connect();
const name = "MyNFT";
const symbol = "NFT";
const usdDecimals = 1e8;
 const initialSupply = 1000000e6;

// 定义Fixture函数
async function deployMyNFTAuctionFixture() {
  const [owner_,seller_, addr1_, addr2_] = await ethers.getSigners();

  const myNFTAuction_ = await ethers.deployContract("MyNFTAuction");
  const name = "MyERC";
  const symbol = "ERC";
  const decimals_ = 6;
  const myERC20_ = await ethers.deployContract("MyERC20", [name,symbol,decimals_,initialSupply]);
  const ethOracle_ = await ethers.deployContract("MyOracle", [3000e8]);
  const myErcOracle_ = await ethers.deployContract("MyOracle", [1e8]);
  const myNFT_ = await ethers.deployContract("MyNFT", ["MyNFT","NFT"]);

  await myERC20_.mint(addr1_,initialSupply);
  await myERC20_.mint(addr2_,initialSupply);

  const initData = myNFTAuction_.interface.encodeFunctionData("initialize", [owner_.address]);
  const auctionAddress = await myNFTAuction_.getAddress();
 
  const proxy_ = await ethers.deployContract("TransparentUpgradeableProxy",
    [auctionAddress,owner_.address,initData]);

    // console.log("myNFTAuction ",await myNFTAuction.getAddress())
    // console.log("proxy ", await proxy.getAddress())
    // console.log("myNFTAuction owner ",await myNFTAuction.owner())
    // console.log("owner ",await owner.getAddress())
    // console.log("addr1 ",await addr1.getAddress())
    // console.log("addr2 ",await addr2.getAddress())

    // owner_,seller_, addr1_, addr2_
    console.log("owner_ ",await ethers.provider.getBalance(owner_.address))
    console.log("seller_ ",await ethers.provider.getBalance(seller_.address))
    console.log("addr1_ ",await ethers.provider.getBalance(addr1_.address))
    console.log("addr2_ ",await ethers.provider.getBalance(addr2_.address))

    
    const auction_ = myNFTAuction_.attach(await proxy_.getAddress()).connect(owner_);
    await auction_.setTokenOracle(await myERC20_.getAddress(),await myErcOracle_.getAddress());
    console.log("setTokenOracle1 " ,await myERC20_.getAddress(),await myErcOracle_.getAddress());
    await auction_.setTokenOracle(ethers.ZeroAddress,await ethOracle_.getAddress());
    console.log("setTokenOracle2 " ,ethers.ZeroAddress,await ethOracle_.getAddress());



    console.log("auction_ " ,await auction_.getAddress());
    console.log("proxy_ " ,await proxy_.getAddress());
    console.log("myERC20_ " ,await myERC20_.getAddress());
    console.log("ethOracle_ " ,await ethOracle_.getAddress());
    console.log("myErcOracle_ " ,await myErcOracle_.getAddress());
    console.log("myNFT_ " ,await myNFT_.getAddress());
    console.log("owner_ " ,await owner_.getAddress());
    console.log("seller_ " ,await seller_.getAddress());
    console.log("addr1_ " ,await addr1_.getAddress());
    console.log("addr2_ " ,await addr2_.getAddress());

  return { auction_,proxy_,myERC20_,ethOracle_,myErcOracle_,myNFT_ ,owner_,seller_, addr1_, addr2_};
}

// 测试套件
describe("MyNFTAuction", function () {
  let myNFTAuction: any;
  let auction: any;
  let proxy: any;
  let myERC20: any;
  let ethOracle: any;
  let myErcOracle: any;
  let myNFT: any;
  let owner: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;
  let tokenId: any;

    // 封装工具函数：增加时间
  const increaseTime = async (seconds: number) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  };

  // 封装工具函数：设置指定时间戳
  const setTimestamp = async (target: bigint) => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(target)]);
    await ethers.provider.send("evm_mine");
  };
  
  beforeEach(async function () {
    const { auction_,proxy_,myERC20_,ethOracle_,myErcOracle_,myNFT_ ,owner_,seller_, addr1_, addr2_} = await networkHelpers.loadFixture(deployMyNFTAuctionFixture);
    auction = auction_;
    proxy = proxy_;
    myERC20 = myERC20_;
    ethOracle = ethOracle_;
    myErcOracle = myErcOracle_;
    myNFT = myNFT_;
    owner = owner_;
    seller = seller_;
    bidder1 = addr1_;
    bidder2 = addr2_;
    tokenId = 1n;
    await myNFT.mint(seller_.address,tokenId);
    await myNFT_.connect(seller_).approve(proxy_,tokenId);
    await myERC20.connect(addr1_).approve(proxy_,initialSupply);
    await myERC20.connect(addr2_).approve(proxy_,initialSupply);

    // console.log("myNFT_ ",await myNFT_.connect(seller_).getApproved(tokenId))
        //     address seller,
        // uint256 nftId,
        // address nft,
        // uint256 startingPriceInDollar,
        // uint256 duration,
        // address paymentToken


  });

  // 获取版本
  it("getVersion", async function () {
    console.log("proxy Address ",await proxy.getAddress());
    
    console.log("Address ",await auction.getAddress());
    console.log("getVersion1 ",await auction.getVersion());
    expect(await auction.connect(bidder1).getVersion()).to.equal("MyNFTAuction V1");
  });


    // 升级
  it("upgradeToV2", async function () {

    console.log("proxy Address ",await proxy.getAddress());
    const myNFTAuctionV2 = await ethers.deployContract("MyNFTAuction_V2");

    console.log("Address ",await auction.getAddress());
    console.log("getVersion1 ",await auction.getVersion());

    await auction.upgradeToAndCall(await myNFTAuctionV2.getAddress(),"0x");

    console.log("Address ",await auction.getAddress());
    console.log("getVersion2 ",await auction.getVersion());
    expect(await auction.connect(bidder1).getVersion()).to.equal("MyNFTAuction V2");
  });

  // 转让所有权
  it("transferOwnership", async function () {

    const myNFTAuctionV2 = await ethers.deployContract("MyNFTAuction_V2");

    console.log("owner old ",await auction.owner());
    const newOwner = bidder1.address;
    await auction.transferOwnership(newOwner);
    console.log("owner new ",await auction.owner());

    expect(await auction.owner()).to.equal(newOwner);
  });

  // 转换美元
  it("_convertToUSD", async function () {
 
    console.log("convertToUSD ");
    console.log("convertToUSD ",ethers.parseEther("1"));
    //1eth = 3000$
    const usdEth = await auction.convertToUSD(ethers.parseEther("1"),ethers.ZeroAddress );
    console.log("usdEth ",usdEth);
    //1erc = 1$
    const usdErc = await auction.convertToUSD(3e9,await myERC20.getAddress());
    console.log("usdErc ",usdErc);

    expect(usdEth).to.equal(300000000000n);
    expect(usdErc).to.equal(300000000000n);

  });

  // 拍卖
  describe("test auction", function () {
    let auctionId: any;
    
    beforeEach(async function () {
      await auction.connect(owner).start(seller.getAddress(),tokenId, await myNFT.getAddress(),10n,30n,await myERC20.getAddress());
      auctionId = (await auction.connect(owner).auctionId() - 1n);
      
    });
    // 卖家发起拍卖
    it("start initialize", async function () {
      console.log("start auctionId ",auctionId);
      const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
      // console.log("ethers.ZeroAddress  ",ethers.ZeroAddress);
      // console.log("ethers.getBlock  ",await ethers.provider.getBlock());

      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      // console.log("ethers.blockNumBefore  ",blockNumBefore);
      // console.log("ethers.blockBefore  ",blockBefore,);
      const endTime = auctionData[3] + 30n;
      // await setTimestamp(endTime);
      // console.log("ethers.endTime  ",endTime);
      // console.log("ethers.timestamp  ",blockBefore.timestamp);
      expect(auctionData[0]).to.equal(await myNFT.getAddress());
      expect(auctionData[1]).to.equal(tokenId);
      expect(auctionData[2]).to.equal(await seller.getAddress());
      expect(auctionData[3]).to.equal(blockBefore.timestamp);
      expect(auctionData[4]).to.equal(endTime);
      expect(auctionData[5]).to.equal(ethers.ZeroAddress);
      expect(auctionData[6]).to.equal(10e8);
      expect(auctionData[7]).to.equal(await myERC20.getAddress());
      expect(auctionData[8]).to.equal(0n);
      expect(auctionData[9]).to.equal(0n);
      expect(auctionData[10]).to.equal(ethers.ZeroAddress);
      expect(auctionData[11]).to.equal(false);

    });

    it("placeEthBid", async function () {
      
      console.log("bidderA ",await ethers.provider.getBalance(bidder1.address))
      await auction.connect(bidder1).placeEthBid(auctionId,{ 
          account: bidder1.account, 
          value: ethers.parseEther("1") 
        });

      console.log("bidderB ",await ethers.provider.getBalance(bidder1.address))
      const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
      
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);

      const usdEth = await auction.convertToUSD(ethers.parseEther("1"),ethers.ZeroAddress );
      expect(auctionData[5]).to.equal(await bidder1.getAddress());
      expect(auctionData[8]).to.equal(ethers.parseEther("1"));
      expect(auctionData[9]).to.equal(usdEth);
      expect(auctionData[10]).to.equal(ethers.ZeroAddress);
      expect(auctionData[11]).to.equal(false);
    });

    
    it("placeErc20Bid", async function () {
      console.log("balance  ",await myERC20.balanceOf(bidder2));
      await auction.connect(bidder2).placeErc20Bid(auctionId, 4e9);
      console.log("balance  ",await myERC20.balanceOf(bidder2));
      console.log("bidder ",await ethers.provider.getBalance(bidder1.address))
      const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
      
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);

      const usdErc = await auction.convertToUSD(4e9,await myERC20.getAddress());
      expect(auctionData[5]).to.equal(await bidder2.getAddress());
      expect(auctionData[8]).to.equal(4e9);
      expect(auctionData[9]).to.equal(usdErc);
      expect(auctionData[10]).to.equal(await myERC20.getAddress());
      expect(auctionData[11]).to.equal(false);
    });


    it("EthBid and ErcBid", async function () {

      console.log("bidderA ",await ethers.provider.getBalance(bidder1.address))
      await auction.connect(bidder1).placeEthBid(auctionId,{ 
          account: bidder1.account, 
          value: ethers.parseEther("1") 
        });
      console.log("bidderB ",await ethers.provider.getBalance(bidder1.address))
      await auction.connect(bidder2).placeErc20Bid(auctionId, 4e9);
      console.log("bidderC ",await ethers.provider.getBalance(bidder1.address))
      expect(await ethers.provider.getBalance(bidder1.address))
        .to.at.least(ethers.parseEther("9999"));
      const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
      
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);

      const usdErc = await auction.convertToUSD(4e9,await myERC20.getAddress());
      expect(auctionData[5]).to.equal(await bidder2.getAddress());
      expect(auctionData[8]).to.equal(4e9);
      expect(auctionData[9]).to.equal(usdErc);
      expect(auctionData[10]).to.equal(await myERC20.getAddress());
      expect(auctionData[11]).to.equal(false);
    });

    it("isEnded", async function () {
      expect(await auction.connect(bidder2).isEnded(auctionId))
        .to.equal(false);
      // const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
    });

    it("end", async function () {
      await auction.connect(bidder1).placeEthBid(auctionId,{ 
          account: bidder1.account, 
          value: ethers.parseEther("1") 
        });
      
      const auctionData = await auction.auctions(auctionId);
      // console.log("auctionData  ",auctionData);
      const endTime = auctionData[4];
      console.log("endTime  ",endTime);
      await setTimestamp(endTime);
      expect(await auction.connect(bidder2).isEnded(auctionId))
        .to.equal(true);

      await expect(auction.end(auctionId))
        .to.emit(auction, "EndBid")
        .withArgs(auctionId);

      const user = await myNFT.ownerOf(tokenId);
      console.log("user ", user);
      console.log("owner ", bidder1);
      expect(user).to.equal(bidder1);
    });

  });
  




});