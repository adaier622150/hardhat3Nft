import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const myNFTModule = buildModule("MyNFTModule", (m) => {
  const name = "MyNFT";
  const symbol = "NFT";
  console.log("=== 开始部署 ===\n");
  const myNFT = m.contract("MyNFT",[name,symbol]);
  console.log("=== 部署完成 ===\n");
  return { myNFT };
});
export default myNFTModule;