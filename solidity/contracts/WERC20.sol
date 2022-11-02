// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract WERC20 {
    mapping(address => uint256) private _balances;

    uint public totalLockedValue;
    string public name;
    string public symbol;

    address public admin;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier onlyNonZeroAddress(address to) {
        require(to != address(0), "Operation to zero address");
        _;
    }

    function lock(address to, uint amount)
        external
        onlyAdmin
        onlyNonZeroAddress(to)
    {
        totalLockedValue += amount;
        _balances[to] += amount; //use unchecked?

        //emit event
    }

    function unlock(address account, uint amount)
        external
        onlyAdmin
        onlyNonZeroAddress(account)
    {
        uint balance = _balances[account];
        require(balance >= amount, "Exceeds balance");
        _balances[account] = balance - amount; //use unchecked?
        totalLockedValue -= amount;
    }

    //emit event
}
