// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bridge {
    uint public lockedValue;
    address payable public owner;

    event Locked(uint amount);
    event Unlocked(uint amount);

    constructor() payable {
        owner = payable(msg.sender);
    }

    function lock(uint amount) public {
        emit Locked(amount);
    }

    function unlock(uint amount) public {
        emit Locked(amount);
    }
}
