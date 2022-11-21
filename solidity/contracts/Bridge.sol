// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "./WrappedTokenFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    WrappedTokenFactory public wrappedTokenFactory;

    mapping(uint256 => bool) public processedNonces;
    mapping(address => mapping(address => uint256)) claimable;

    event Lock(
        address indexed from,
        address token,
        uint16 targetChainId,
        uint256 amount
    );

    event Release(address indexed receiver, address token, uint256 amount);

    event Burn(
        address indexed from,
        address token,
        uint16 targetChainId,
        uint256 amount
    );

    event Mint(address indexed receiver, address token, uint256 amount);

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

        emit Lock(msg.sender, token, targetChainId, amount);
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

        emit Lock(msg.sender, token, targetChainId, amount);
    }

    //Should be able to be called by service only.
    function release(
        //address receiver,
        address token,
        uint256 amount
    ) external {
        ERC20Token(token).transfer(msg.sender, amount);

        emit Release(msg.sender, token, amount);
    }

    function burnWithPermit(
        address token,
        uint16 targetChainId,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(amount > 0, "burn amount < 1");

        ERC20Token wrappedTokenContract = wrappedTokenFactory.getToken(token);
        require(address(wrappedTokenContract) != address(0));

        ERC20Token(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        wrappedTokenContract.burnFrom(msg.sender, amount);

        emit Burn(msg.sender, token, targetChainId, amount);
    }

    //Should be able to be called by service only.
    function mint(
        address receiver,
        address token,
        uint256 amount
    ) external {
        ERC20Token wrappedTokenContract = wrappedTokenFactory.getToken(token);
        require(address(wrappedTokenContract) != address(0));

        wrappedTokenContract.mint(receiver, amount);

        emit Mint(receiver, token, amount);
    }

    function setClaimable(
        address to,
        address token,
        uint256 amount,
        uint256 otherChainNonce
    ) external {
        require(
            processedNonces[otherChainNonce] == false,
            "transfer already processed"
        );
        processedNonces[otherChainNonce] = true;

        claimable[to][token] = amount;
    }
}
