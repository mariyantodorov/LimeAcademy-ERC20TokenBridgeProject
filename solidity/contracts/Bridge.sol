// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "./WERC20Factory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    WERC20Factory public wERC20Factory;

    enum Step {
        Lock,
        Unlock
    }
    //add chain id?
    event Transfer(address from, address to, uint amount, Step indexed step);

    constructor(address _wERC20Factory) {
        wERC20Factory = _wERC20Factory;
    }

    function lock(
        //uint256 targetChainId,
        address token, //payable??
        uint256 amount
    ) external {
        require(amount > 0, "lock amount < 1");

        ERC20Token(token).transferFrom(msg.sender, address(this), amount);

        emit Transfer(msg.sender, token, amount, Step.Lock);
    }

    //the front end will hash the message and split it
    function lockWithPermit(
        //uint256 targetChainId,
        address token, //payable?
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public payable {
        require(amount > 0, "lock amount < 1");

        ERC20Token(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        ERC20Token(token).transferFrom(msg.sender, address(this), amount);

        emit Transfer(msg.sender, token, amount, Step.Lock);
    }

    function unlock(
        address token,
        address receiver,
        uint amount
    ) external {
        //check allowance?
        ERC20Token(token).transfer(msg.sender, amount);
        emit Transfer(msg.sender, token, amount, Step.Unlock);
    }

    //when are we using this function and who should be able to call it?
    function createToken(string calldata name, string calldata symbol)
        external
    {
        wERC20Factory.createToken(name, symbol);
    }
}
