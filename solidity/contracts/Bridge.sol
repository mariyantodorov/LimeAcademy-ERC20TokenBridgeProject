// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "./WrappedTokenFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    WrappedTokenFactory public wrappedTokenFactory;
    uint256 public nonce;
    mapping(uint256 => bool) public processedNonces;

    event Lock(
        address indexed from,
        address token,
        uint16 targetChainId,
        uint256 amount,
        uint256 nonce
    );

    event Release(
        address indexed receiver,
        address token,
        uint256 amount,
        uint256 nonce
    );

    constructor(address _wrappedTokenFactory) {
        wrappedTokenFactory = WrappedTokenFactory(_wrappedTokenFactory);
    }

    function lock(
        address token,
        uint16 targetChainId,
        uint256 amount
    ) external {
        require(amount > 0, "lock amount < 1");

        ERC20Token(token).transferFrom(msg.sender, address(this), amount);

        emit Lock(msg.sender, token, targetChainId, amount, nonce);
        nonce++;
    }

    function lockWithPermit(
        address token,
        uint16 targetChainId,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
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

        emit Lock(msg.sender, token, targetChainId, amount, nonce);
        nonce++;
    }

    function release(
        address receiver,
        address token,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 amount,
        uint256 otherChainNonce
    ) external {
        //how to check if signature is correct
        require(
            processedNonces[otherChainNonce] == false,
            "transfer already processed"
        );
        processedNonces[otherChainNonce] = true;

        ERC20Token wrappedToken = wrappedTokenFactory.getToken(token);
        if (address(wrappedToken) == address(0)) {
            ERC20Token newWrappedToken = wrappedTokenFactory.createToken(
                tokenName,
                tokenSymbol,
                address(this)
            );

            newWrappedToken.mint(receiver, amount);
        } else {
            ERC20Token(token).mint(receiver, amount);
        }

        emit Release(receiver, token, amount, otherChainNonce);
    }
}
