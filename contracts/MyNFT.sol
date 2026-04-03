// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    uint256 private _nextId = 1;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
    }

    function mint(address to, uint256 id) external {
        _mint(to, id);
    }

    function mintNext(address to) external returns (uint256) {
        _mint(to, _nextId);
        uint256 id = _nextId;
        _nextId++;
        return id;
    }
    function nextId()  public view  returns (uint256) {
        return _nextId;
    }

    function burn(uint256 id) external {
        require(msg.sender == ownerOf(id), "not owner");
        _burn(id);
    }
}
