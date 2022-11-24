// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./ERC20Token.sol";
import "./WrappedTokenFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    address public relayer;
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

    constructor(address _wrappedTokenFactory) {
        wrappedTokenFactory = WrappedTokenFactory(_wrappedTokenFactory);
        relayer = msg.sender;
    }

    function setWrappedTokenFactory(address newWrappedTokenFactory)
        external
        onlyOwner
    {
        wrappedTokenFactory = WrappedTokenFactory(newWrappedTokenFactory);
    }

    function setValidator(address newValidator) external onlyOwner {
        relayer = newValidator;
    }

    //TODO: custom error
    function lockWithPermit(
        address token,
        uint16 targetChainId,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(amount > 0, "amount < 1");

        ERC20Token(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        if (address(wrappedTokenFactory.getToken(token)) != address(0)) {
            ERC20Token(token).burnFrom(msg.sender, amount);
        } else {
            ERC20Token(token).transferFrom(msg.sender, address(this), amount);
        }

        emit Lock(msg.sender, token, targetChainId, amount);
    }

    //TODO: called more than once protection? custom error
    function release(address token, uint256 amount) external {
        require(claimable[msg.sender][token] >= amount, "Cannot claim.");

        ERC20Token wrappedTokenContract = wrappedTokenFactory.getToken(token);
        if (address(wrappedTokenContract) != address(0)) {
            wrappedTokenContract.mint(msg.sender, amount);
        } else {
            ERC20Token(token).transfer(msg.sender, amount);
        }

        emit Release(msg.sender, token, amount);
    }

    function setClaimable(
        address to,
        address sourceToken,
        string calldata sourceTokenName,
        string calldata sourceTokenSymbol,
        uint256 amount
    ) external {
        require(msg.sender == relayer, "not relayer");

        address tokenAddress = wrappedTokenFactory.tokenRegistry(sourceToken);

        if (tokenAddress == address(0)) {
            ERC20Token wrappedToken = wrappedTokenFactory.createToken(
                sourceTokenName,
                sourceTokenSymbol
            );
            wrappedTokenFactory.register(sourceToken, address(wrappedToken));
            tokenAddress = address(wrappedToken);
        }

        claimable[to][tokenAddress] = amount;
    }
}
