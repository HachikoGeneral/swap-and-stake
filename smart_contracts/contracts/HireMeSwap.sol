// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ChikoStake {
    mapping(address => mapping(address => bool)) public allowedSwaps;
    mapping(address => bool) public isAllowedToken;
    mapping(address => address) public tokenPriceFeeds;
    address[] public allowedTokens;
    address public owner;
    IERC20 public WrappedChikoToken;

    constructor() {
        owner = msg.sender;
        WrappedChikoToken = IERC20(0x2e5E530dC2C6b2A8f214ee929dC4a302575881A9)
        ];

    function getPoolBalance(address _token) public view returns (uint256) {
        uint256 poolBalance = IERC20(_token).balanceOf(address(this));
        return poolBalance;
    }

    function withdrawPoolToken(address _token) public onlyOwner {
        IERC20(_token).transfer(
            msg.sender,
            IERC20(_token).balanceOf(address(this))
        );
    }

    function depositPoolToken(address _token, uint256 _amount)
        public
        onlyOwner
        onlyAllowedTokens(_token)
    {
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }

    modifier onlyAllowedTokens(address _token) {
        require(isAllowedToken[_token], "this token is not allowed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }
}
