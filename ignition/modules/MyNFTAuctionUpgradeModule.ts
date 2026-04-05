import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import MyNFTAuctionModule from "./MyNFTAuctionProxyModule.js";

const myNFTAuctionUpgradeModule = buildModule(
  "MyNFTAuctionUpgradeModule",
  (m) => {
    const proxyAdminOwner = m.getAccount(0);

    const { auction, proxy } = m.useModule(MyNFTAuctionModule);

    console.log("=== 开始部署 V2 ===\n");
    const auctionV2 = m.contract("MyNFTAuction_V2");
    console.log("=== 部署完成 V2 ===\n");

    console.log("=== 开始升级部署 V2 ===\n");
    m.call(auction, "upgradeToAndCall", [auctionV2,"0x"]);
    console.log("=== 开始升级部署完成 V2 ===\n");
    // const str = m.call(auction, "getVersion");
    // const str = m.staticCall(auction, "getVersion");
    // console.log(str);
    // const auctionId = m.staticCall(auction, "auctionId");
    // console.log(auctionId);
    console.log("=== 开始升级部署完成 getVersion ===\n");

    return { auction, proxy};
  },
);

export default myNFTAuctionUpgradeModule;
