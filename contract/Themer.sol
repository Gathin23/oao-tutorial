// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IErc7007.sol";
import "./IVerifier.sol";

contract Themer is IErc7007, ERC721, ERC721URIStorage, Ownable {
    uint256 public _nextTokenId;
    IVerifier public verifierContract;
    mapping(uint256 tokenId => bytes16 metadata) public tokenIdMetadata;

    constructor(IVerifier _verifierContract)
        ERC721("Themer", "TK")
        Ownable(msg.sender)
    {
        verifierContract = _verifierContract;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://nft.susanoox.in/";
    }

    function safeMint(address to, uint256 tokenID, string calldata uri) public onlyOwner {
        _safeMint(to, tokenID);
        _setTokenURI(tokenID, uri);
    }

    function mint(
        bytes calldata prompt,
        bytes calldata aigcData,
        string calldata uri,
        bytes calldata proof
    )
        external
        returns (
            // requireRegistry
            uint256
        )
    {
        // verify correctlyness of prompt
        // require(verify(prompt, aigcData, proof), "incorrrect proof");
        uint256 tokenIdNow = _nextTokenId;
        _nextTokenId++;
        safeMint(msg.sender, tokenIdNow, uri);
        tokenIdMetadata[tokenIdNow] = bytes16(aigcData);

        emit Mint(tokenIdNow, prompt, aigcData, uri, proof);
        return tokenIdNow;
    }

    function verify(
        bytes calldata prompt,
        bytes calldata aigcData,
        bytes calldata proof
    ) public view returns (bool success) {
        bytes[] memory _inputs;
        _inputs[0] = prompt;
        _inputs[1] = aigcData;
        return verifierContract.verify(_inputs, proof);
    }

    function getMetadata(uint256 tokenId) public view returns (bytes16) {
        return tokenIdMetadata[tokenId];
    }

    function masterMint(bytes calldata aigcData, string calldata uri) public returns (uint256) {
        uint256 tokenIdNow = _nextTokenId++;
        safeMint(msg.sender, tokenIdNow, uri);
        tokenIdMetadata[tokenIdNow] = bytes16(aigcData);

        bytes memory fakePrompt = "fake";
        emit Mint(tokenIdNow, fakePrompt, aigcData, "", fakePrompt);
        return tokenIdNow;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165, ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}