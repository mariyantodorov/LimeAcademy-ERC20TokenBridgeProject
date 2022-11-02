// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./WERC20.sol";

contract BridgeFactory {
    address public admin;
    mapping(address => WERC20) private _tokens;

    enum Step {
        Lock,
        Unlock
    }

    //add chain id?
    event Transfer(address from, address to, uint amount, Step indexed step);

    constructor() {
        admin = msg.sender;
    }

    function lock(address to, uint amount) external {
        if (_tokens[to].admin() != address(0)) {
            _tokens[to].lock(to, amount);
        } else {
            //deploy token
        }

        emit Transfer(msg.sender, to, amount, Step.Lock);
    }

    function unlock(address to, uint amount) external {
        emit Transfer(msg.sender, to, amount, Step.Unlock);
    }
}
