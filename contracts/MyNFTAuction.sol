// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MyNFTAuction is Initializable, UUPSUpgradeable {
    address private _owner;
    mapping(address => address) public tokenToOracle;

    struct Auction {
        //拍卖的NFT地址 
        IERC721 nft;
        //拍卖的NFT唯一tokenId
        uint256 nftId;
        //卖家
        address payable seller;
        //开始时间
        uint256 startingTime;
        //结束时间
        uint256 endTime;
        //最高出价者
        address highestBidder;
        //起始价格（美元）
        uint256 startingPriceInDollar;
        //支付凭证
        IERC20 paymentToken;
        //最高出价
        uint256 highestBid;
        //最高美元出价
        uint256 highestBidInDollar;
        //最高出价代币
        address highestBidToken;
        //拍卖是否结束
        bool ended;
    }
    mapping(uint256 => Auction) public auctions;

    event StartBid(uint256 startingBid);
    event BidEth(address indexed sender, uint256 amount);
    event BidErc(address indexed sender, uint256 amount);
    event EndBid(uint256 indexed auctionId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    uint256 public auctionId;

    error OwnableUnauthorizedAccount(address account);

    modifier onlyOwner() {
        if (owner() != msg.sender) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
        _;
    }
    // 初始化
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin_) external initializer {
        require(admin_ != address(0), "invalid admin");
        _owner = admin_;
        emit OwnershipTransferred(address(0), admin_);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function owner() public view returns (address) {
        return _owner;
    }

    // 转让所有权
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "invalid new owner");
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function setTokenOracle(address token, address oracle) external onlyOwner {
        require(oracle != address(0), "invalid oracle");
        tokenToOracle[token] = oracle;
    }
    // 卖家发起拍卖
    function start(
        address seller,
        uint256 nftId,
        address nft,
        uint256 startingPriceInDollar,
        uint256 duration,
        address paymentToken
    ) external onlyOwner {
        require(nft != address(0), "invalid nft");
        require(duration >= 30, "invalid duration");
        require(paymentToken != address(0), "invalid payment token");
        Auction storage auction = auctions[auctionId];
        auction.nft = IERC721(nft);
        auction.nftId = nftId;
        auction.seller = payable(seller);
        auction.startingTime = block.timestamp;
        auction.endTime = block.timestamp + duration;
        auction.startingPriceInDollar = startingPriceInDollar * 10**8;
        auction.paymentToken = IERC20(paymentToken);
        auction.highestBid = 0;
        auction.highestBidder = address(0);
        auction.highestBidInDollar = 0;
        auction.highestBidToken = address(0);
        auction.ended = false;
        IERC721(nft).transferFrom(seller, address(this), nftId);
        auctionId++;
        emit StartBid(auctionId);
    }

    // 买家竞价 EHT
    function placeEthBid(uint256 auctionId_) external payable {
        Auction storage auction = auctions[auctionId_];
        require(auction.startingTime > 0, "not started");
        require(!isEnded(auctionId_), "ended");
        require(msg.value > 0, "invalid Bid");
        uint256 bidPrice = _convertToUSD(msg.value, address(0));
        require(auction.startingPriceInDollar < bidPrice, "invalid startingPrice");
        require(auction.highestBidInDollar < bidPrice, "invalid highestBid");
        _returnUnsuccessfulBids(auction);
        auction.highestBid = msg.value;
        auction.highestBidToken = address(0);
        auction.highestBidder = msg.sender;
        auction.highestBidInDollar = bidPrice;
        emit BidEth(msg.sender, msg.value);
    }
    // 买家竞价 ERC20
    function placeErc20Bid(uint256 auctionId_, uint256 amount) external  {
        Auction storage auction = auctions[auctionId_];
        require(auction.startingTime > 0, "not started");
        require(!isEnded(auctionId_), "ended");
        require(amount > 0, "invalid amount");
        uint256 bidPrice = _convertToUSD(amount, address(auction.paymentToken));
        IERC20(address(auction.paymentToken)).transferFrom(msg.sender, address(this), amount);
        require(auction.startingPriceInDollar < bidPrice, "invalid startingPrice");
        require(auction.highestBidInDollar < bidPrice, "invalid highestBid");
        _returnUnsuccessfulBids(auction);
        auction.highestBid = amount;
        auction.highestBidToken = address(auction.paymentToken);
        auction.highestBidder = msg.sender;
        auction.highestBidInDollar = bidPrice;
        emit BidErc(msg.sender, amount);
    }
    // 退回未中标
    function _returnUnsuccessfulBids(Auction storage auction) internal {
        if (auction.highestBidder != address(0)) {
            uint256 refundAmount = auction.highestBid;
            if (refundAmount > 0) {
                if (auction.highestBidToken == address(0)) {
                    payable(auction.highestBidder).transfer(refundAmount);
                } else {
                    IERC20(address(auction.paymentToken)).transfer(auction.highestBidder, refundAmount);
                }
            }
        }
    }

    // 判断拍卖是否结束
    function isEnded(uint256 auctionId_) public view returns (bool) {
        Auction storage auction = auctions[auctionId_];
        return auction.startingTime > 0 && block.timestamp >= auction.endTime;
    }

    // 拍卖结束 NFT 转移给出价最高者，资金转移给卖家。
    function end(uint256 auctionId_) external {
        Auction storage auction = auctions[auctionId_];
        require(auction.ended == false, "Auction already ended");
        require(isEnded(auctionId_), "not ended");
        require(auction.highestBidder != address(0), "no bids");
        auction.ended = true;
        auction.nft.transferFrom(address(this), auction.highestBidder, auction.nftId);
        
        if (auction.highestBid > 0) {
            if (auction.highestBidToken == address(0)) {
                payable(auction.seller).transfer(auction.highestBid);
            } else {
                IERC20(auction.highestBidToken).transfer(auction.seller, auction.highestBid);
            }
        }
        emit EndBid(auctionId_);
    }

    // 转换美元
    function _convertToUSD(uint256 amount, address token) internal view returns (uint256) {
        AggregatorV3Interface dataFeed;
        address oracle = tokenToOracle[token];
        require(oracle != address(0), "oracle not set");
        dataFeed = AggregatorV3Interface(oracle);
        (, int256 answer,,,) = dataFeed.latestRoundData();
        require(answer > 0, "Invalid price returned from oracle");
        uint8 amountDecimals = 18;
        if(token != address(0) ){
            amountDecimals = IERC20Metadata(token).decimals();
        }
        uint256 scale = 10 ** amountDecimals;
        uint256 usd = (amount * uint256(answer)) / scale;
        return usd;
    }
    
    // 转换美元
    function convertToUSD(uint256 amount, address token) public view returns (uint256) {
        return _convertToUSD(amount, token);
    }
    // 获取当前版本
    function getVersion() public pure virtual returns (string memory) {
        return "MyNFTAuction V1";
    }
}
