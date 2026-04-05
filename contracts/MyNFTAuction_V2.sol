// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./MyNFTAuction.sol";

contract MyNFTAuction_V2 is MyNFTAuction {
    function getVersion() public pure override returns (string memory) {
        return "MyNFTAuction V2";
    }

    function newFeature() external pure returns (string memory) {
        return "This is a new feature in  V2";
    }
}
