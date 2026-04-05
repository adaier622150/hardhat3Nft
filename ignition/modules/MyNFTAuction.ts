import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const myNFTAuctionModule = buildModule("MyNFTAuctionModule", (m) => {
  console.log("=== 开始部署 ===\n");
  const myNFTAuction = m.contract("MyNFTAuction")
  console.log("=== 部署完成 ===\n");
  return { myNFTAuction };
});
export default myNFTAuctionModule;