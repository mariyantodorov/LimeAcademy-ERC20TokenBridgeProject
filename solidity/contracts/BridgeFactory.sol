// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./WERC20.sol";

contract BridgeFactory {
    address public admin;
    mapping(address => WERC20) public tokens;
    mapping(bytes32 => bool) private existingTokens;

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
        //check if exists
        tokens[to].lock(to, amount);
        emit Transfer(msg.sender, to, amount, Step.Lock);
    }

    function unlock(address account, uint amount) external {
        tokens[account].unlock(account, amount);
        emit Transfer(msg.sender, account, amount, Step.Unlock);
    }

    function createToken(string memory name, string memory symbol) external {
        require(
            existingTokens[keccak256(abi.encodePacked(name))] == false,
            "Token already exists"
        );

        //how to get the address of the new contract ???
        WERC20 newToken = new WERC20(name, symbol);
        tokens[msg.sender] = newToken;
        existingTokens[keccak256(abi.encodePacked(name))] = true;
    }
}
