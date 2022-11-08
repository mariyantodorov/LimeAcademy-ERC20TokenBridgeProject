// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Registry to keep track of eixsting and created tokens???
contract WERC20Factory is Ownable {
    mapping(address => ERC20Token) private wrappedTokens;

    event TokenCreated(name, symbol, address); //indexed?

    function createToken(string calldata name, string calldata symbol)
        external
        onlyOwner
    {
        //check if exists needed??
        ERC20Token wrappedToken = new ERC20Token(name, symbol);
        wrappedTokens[address(wrappedToken)] = wrappedToken;
        emit TokenCreated(name, symbol, address(wrappedToken));
    }

    function getToken(address token) public view returns (ERC20Token) {
        return wrappedToken[token];
    }
}
