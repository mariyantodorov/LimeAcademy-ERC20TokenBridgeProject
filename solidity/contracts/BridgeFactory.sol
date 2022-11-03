// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeFactory is Ownable {
    mapping(address => WERC20) private tokens;

    enum Step {
        Lock,
        Unlock
    }
    //add chain id?
    event Transfer(address from, address to, uint amount, Step indexed step);

    constructor() {}

    function lock(address token, uint amount) external {
        require(_amount > 0, "amount < 1");
        ERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Transfer(msg.sender, token, amount, Step.Lock);
    }

    function unlock(
        address token,
        address receiver,
        uint amount
    ) external {
        ERC20(token).transfer(msg.sender, amount);
        emit Transfer(msg.sender, account, amount, Step.Unlock);
    }

    //TODO: extract in another contract
    function createToken(string calldata name, string calldata symbol)
        external
    {
        //check if exists needed??
        WERC20 wrappedToken = new WERC20(name, symbol);
        tokens[address(wrappedToken)] = wrappedToken;
        //emit event
    }
}
