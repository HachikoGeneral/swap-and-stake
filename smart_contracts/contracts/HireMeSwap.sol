// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract HireMeSwap {
    mapping(address => mapping(address => bool)) public allowedSwaps;
    mapping(address => bool) public isAllowedToken;
    mapping(address => address) public tokenPriceFeeds;
    address[] public allowedTokens;
    address public owner;
    IERC20 public HireMeToken;

    constructor() {
        owner = msg.sender;
        HireMeToken = IERC20(0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B);
        allowedTokens = [
            0xd0A1E359811322d97991E03f863a0C30C2cF029C,
            0xa36085F69e2889c224210F603D836748e7dC0088,
            0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa,
            0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B
        ];

        isAllowedToken[0xd0A1E359811322d97991E03f863a0C30C2cF029C] = true; //WETH
        isAllowedToken[0xa36085F69e2889c224210F603D836748e7dC0088] = true; //LINK
        isAllowedToken[0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa] = true; //DAI
        isAllowedToken[0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B] = true; //HMT

        allowedSwaps[0xd0A1E359811322d97991E03f863a0C30C2cF029C][
            0xa36085F69e2889c224210F603D836748e7dC0088
        ] = true; //weth/link
        allowedSwaps[0xd0A1E359811322d97991E03f863a0C30C2cF029C][
            0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
        ] = true; //weth/dai
        allowedSwaps[0xd0A1E359811322d97991E03f863a0C30C2cF029C][
            0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B
        ] = true; //weth/hmt
        allowedSwaps[0xa36085F69e2889c224210F603D836748e7dC0088][
            0xd0A1E359811322d97991E03f863a0C30C2cF029C
        ] = true; //link/weth
        allowedSwaps[0xa36085F69e2889c224210F603D836748e7dC0088][
            0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
        ] = true; //link/dai
        allowedSwaps[0xa36085F69e2889c224210F603D836748e7dC0088][
            0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B
        ] = true; //link/hmt
        allowedSwaps[0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa][
            0xd0A1E359811322d97991E03f863a0C30C2cF029C
        ] = true; //dai/weth
        allowedSwaps[0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa][
            0xa36085F69e2889c224210F603D836748e7dC0088
        ] = true; //dai/link
        allowedSwaps[0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa][
            0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B
        ] = true; //dai/hmt
        allowedSwaps[0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B][
            0xd0A1E359811322d97991E03f863a0C30C2cF029C
        ] = true; //hmt/weth
        allowedSwaps[0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B][
            0xa36085F69e2889c224210F603D836748e7dC0088
        ] = true; //hmt/link
        allowedSwaps[0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B][
            0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
        ] = true; //hmt/dai

        tokenPriceFeeds[
            0xd0A1E359811322d97991E03f863a0C30C2cF029C
        ] = 0x9326BFA02ADD2366b30bacB125260Af641031331; //weth/usd
        tokenPriceFeeds[
            0xa36085F69e2889c224210F603D836748e7dC0088
        ] = 0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0; //link/usd
        tokenPriceFeeds[
            0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
        ] = 0x777A68032a88E5A84678A77Af2CD65A7b3c0775a; //dai/usd
        tokenPriceFeeds[
            0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B
        ] = 0x777A68032a88E5A84678A77Af2CD65A7b3c0775a; //HMT/usd. **HMT is pegged to DAI
    }

    function swap(
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) public onlyAllowedSwaps(_fromToken, _toToken) {
        require(_amountIn > 0, "You must swap more than 0");
        require(allowedSwaps[_fromToken][_toToken], "This swap is not allowed");
        IERC20(_fromToken).transferFrom(msg.sender, address(this), _amountIn);
        uint256 amountOut = calculateReturn(_fromToken, _toToken, _amountIn);
        require(
            IERC20(_toToken).balanceOf(address(this)) >= amountOut,
            "pool does't have enough liquidity to fulfill swap. Please swap less"
        );
        IERC20(_toToken).transfer(msg.sender, amountOut);
    }

    function calculateReturn(
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) public view returns (uint256) {
        int256 fromUSDRate = getLatestPrice(tokenPriceFeeds[_fromToken]);
        uint256 totalUSDIn = _amountIn * uint256(fromUSDRate);
        int256 toUSDRate = 1 / getLatestPrice(tokenPriceFeeds[_toToken]);
        uint256 totalTokensOut = totalUSDIn * uint256(toUSDRate);
        return totalTokensOut;
    }

    function getLatestPrice(address _priceFeedAddress)
        public
        view
        returns (int256)
    {
        AggregatorV3Interface priceFeed;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        int256 formattedPrice = price / (10**8);
        return formattedPrice;
    }

    function addAllowedToken(address _token, address _priceFeed)
        public
        onlyOwner
    {
        require(!isAllowedToken[_token], "This token is already allowed");
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            allowedSwaps[_token][allowedTokens[i]] = true;
            allowedSwaps[allowedTokens[i]][_token] = true;
        }
        tokenPriceFeeds[_token] = _priceFeed;
        isAllowedToken[_token] = true;
        allowedTokens.push(_token);
    }

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

    modifier onlyAllowedSwaps(address _fromToken, address _toToken) {
        require(allowedSwaps[_fromToken][_toToken], "This swap is not allowed");
        _;
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
