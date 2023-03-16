// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WrappedChikoStake {
    mapping(address => mapping(address => bool)) public isStaker;
    mapping(address => mapping(address => uint256)) public amountStaked;
    mapping(address => mapping(address => uint256)) public lastRewardRedemption;
    mapping(address => mapping(address => bool)) public hasRedeemed;
    mapping(address => mapping(address => uint256)) public amountReedeemed;
    mapping(address => bool) public isAllowed;
    mapping(address => address) public tokenPriceFeeds;
    address public owner;
    uint256 public totalAmountStaked;
    IERC20 public WrappedChikoToken;

    event NewDeposit(
        address depositer,
        address token,
        uint256 amount,
        uint256 date
    );

    event NewWithdraw(
        address withdrawler,
        address token,
        uint256 amount,
        uint256 date
    );

    event RewardsRedeemed(
        address redeemer,
        address token,
        uint256 amount,
        uint256 date
    );

    constructor() {
        owner = msg.sender;
        WrappedChikoToken = IERC20(0x2e5E530dC2C6b2A8f214ee929dC4a302575881A9);
    }

    function deposit(address _token, uint256 _amount)
        public
        onlyAllowed(_token)
    {
        require(_amount > 0, "You must deposit more than 0");
        if (!isStaker[msg.sender][_token]) {
            isStaker[msg.sender][_token] = true;
            hasRedeemed[msg.sender][_token] = false;
        }
        amountStaked[msg.sender][_token] += _amount;
        totalAmountStaked += _amount;
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        emit NewDeposit(msg.sender, _token, _amount, block.timestamp);
    }

    function withdraw(address _token, uint256 _amount)
        public
        onlyAllowed(_token)
    {
        require(isStaker[msg.sender][_token], "You dont have anything staked");
        require(
            amountStaked[msg.sender][_token] >= _amount,
            "You dont have enough staked"
        );
        amountStaked[msg.sender][_token] -= _amount;
        totalAmountStaked -= _amount;
        IERC20(_token).transfer(msg.sender, _amount);
        emit NewWithdraw(msg.sender, _token, _amount, block.timestamp);
    }

    function claimRewards(address _token) public onlyAllowed(_token) {
        if (!hasRedeemed[msg.sender][_token]) {
            uint256 wholeAmountStaked = (amountStaked[msg.sender][_token]);
            uint256 usdConvert = uint256(
                getLatestPrice(tokenPriceFeeds[_token])
            );
            uint256 usdStaked = wholeAmountStaked * usdConvert;
            uint256 rewards = usdStaked / 50;
            hasRedeemed[msg.sender][_token] = true;
            lastRewardRedemption[msg.sender][_token] = block.timestamp;
            amountReedeemed[msg.sender][_token] += rewards;
            WrappedChikoToken.transfer(msg.sender, rewards);
            emit RewardsRedeemed(msg.sender, _token, rewards, block.timestamp);
        } else {
            require(
                (block.timestamp - lastRewardRedemption[msg.sender][_token]) >
                    10,
                "you cant claim rewards yet"
            );
            uint256 wholeAmountStaked = (amountStaked[msg.sender][_token]);
            uint256 usdConvert = uint256(
                getLatestPrice(tokenPriceFeeds[_token])
            );
            uint256 usdStaked = wholeAmountStaked * usdConvert;
            uint256 rewards = usdStaked / 50;
            lastRewardRedemption[msg.sender][_token] = block.timestamp;
            amountReedeemed[msg.sender][_token] += rewards;
            WrappedChikoToken.transfer(msg.sender, rewards);
            emit RewardsRedeemed(msg.sender, _token, rewards, block.timestamp);
        }
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
        isAllowed[_token] = true;
        tokenPriceFeeds[_token] = _priceFeed;
    }

    function removeAllowedToken(address _token) public onlyOwner {
        isAllowed[_token] = false;
    }

    function withdrawWCHK() public onlyOwner {
        WrappedChikoToken.transfer(msg.sender, WrappedChikoToken.balanceOf(address(this)));
    }

    modifier onlyAllowed(address _token) {
        require(isAllowed[_token], "this token is not allowed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }
}
