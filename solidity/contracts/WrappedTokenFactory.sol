// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WrappedTokenFactory is Ownable {
    mapping(address => ERC20Token) private _wrappedTokenContracts;
    //sourceTokenAddress => currentTokenAddress
    mapping(address => address) public tokenRegistry;

    event TokenCreated(string name, string symbol, address tokenAddress);

    function createToken(string calldata name, string calldata symbol)
        external
        onlyOwner
        returns (ERC20Token wrappedToken)
    {
        wrappedToken = new ERC20Token(name, symbol, msg.sender);
        _wrappedTokenContracts[address(wrappedToken)] = wrappedToken;
        emit TokenCreated(name, symbol, address(wrappedToken));
    }

    function getToken(address token) public view returns (ERC20Token) {
        return _wrappedTokenContracts[token];
    }

    function register(address sourceTokenAddress, address currentTokenAddress)
        external
        onlyOwner
    {
        tokenRegistry[sourceTokenAddress] = currentTokenAddress;
        //event
    }
}
