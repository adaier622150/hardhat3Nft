// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./MyNFTAuctionUUPS.sol";

contract MyNFTAuctionUUPS_V2 is MyNFTAuctionUUPS {
    function getVersion() external pure override returns (string memory) {
        return "MyNFTAuctionUUPS V2";
    }

    function newFeature() external pure returns (string memory) {
        return "This is a new feature in UUPS V2";
    }
}
