// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    mapping(address => WERC20) private tokens;

    enum Step {
        Lock,
        Unlock
    }
    //add chain id?
    event Transfer(address from, address to, uint amount, Step indexed step);

    constructor() {}

    function lock(
        //uint256 targetChainId,
        address token, //payable??
        uint256 amount
    ) external {
        require(amount > 0, "lock amount < 1");

        ERC20(token).transferFrom(msg.sender, address(this), amount);

        emit Transfer(msg.sender, token, amount, Step.Lock);
    }

    //TODO: Change to lock with permits
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
        // require(
        //     recoverSigner(hashedMessage, v, r, s) == receiver,
        //     "Receiver does not signed the message"
        // );

        ERC20(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        ERC20(token).transferFrom(msg.sender, address(this), amount);

        emit Transfer(msg.sender, token, amount, Step.Lock);
    }

    function unlock(
        address token,
        address receiver,
        uint amount
    ) external {
        //check allowance?
        ERC20(token).transfer(msg.sender, amount);
        emit Transfer(msg.sender, token, amount, Step.Unlock);
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

    // function recoverSigner(
    //     bytes32 hashedMessage,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) internal returns (address) {
    //     bytes32 messageDigest = keccak256(
    //         abi.encodePacked(
    //             "\\x19Ethereum Signed Message:\\n32",
    //             hashedMessage
    //         )
    //     );
    //     return ecrecover(messageDigest, v, r, s);
    // }
}
