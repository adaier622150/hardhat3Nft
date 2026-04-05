import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const myNFTAuctionProxyModule = buildModule(
  "MyNFTAuctionProxyModule",
  (m) => {
    const proxyAdminOwner = m.getAccount(0);
    console.log("=== 开始部署 MyNFTAuction ===\n");
    const auctionImpl = m.contract("MyNFTAuction");
    console.log("=== 部署完成 MyNFTAuction ===\n");

    const encodedFunctionCall = m.encodeFunctionCall(
      auctionImpl,
      "initialize",
      [proxyAdminOwner],
    );

    console.log("=== 开始部署 Proxy ===\n");
    const proxy = m.contract("TransparentUpgradeableProxy", [
      auctionImpl,
      proxyAdminOwner,
      encodedFunctionCall,
    ]);
    console.log("=== 部署完成 Proxy ===\n");

    return {  proxy };
  },
);

const myNFTAuctionModule = buildModule("MyNFTAuctionModule", (m) => {
  const { proxy } = m.useModule(myNFTAuctionProxyModule);

  console.log("=== 获取代理MyNFTAuction实例  ===\n");
  const auction = m.contractAt("MyNFTAuction", proxy);
  console.log("=== 获取代理MyNFTAuction实例完成  ===\n");

  return { auction, proxy };
});

export default myNFTAuctionModule;
