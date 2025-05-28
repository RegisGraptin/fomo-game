// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import { ConfidentialWETH } from "fhevm-contracts/contracts/token/ERC20/ConfidentialWETH.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Fomo is SepoliaZamaFHEVMConfig, SepoliaZamaGatewayConfig, GatewayCaller, ConfidentialWETH {
    uint64 public constant UNIT_KEY_PRICE = 1e14; // 0.0001 ETH
    uint256 public constant UNIT_TIME_INCREASE = 30 minutes;

    euint64 hiddenPoolPrize;
    euint256 countdownTimer;

    bool public isGameFinished;

    // Set the pool prize - The amount will be revealed only after a set of time
    uint256 public lastPoolPrize;
    uint256 public lastPoolPrizeTime;

    // Store the current winner and the amount of bids from users
    address public winner;
    mapping(address => euint64) public bids;
    mapping(uint256 _requestId => address _user) public requestedUsers;

    error GameIsRunning();
    error GameIsFinished();
    error PendingTimeError();

    constructor(uint256 maxDecryptionDelay_) ConfidentialWETH(maxDecryptionDelay_) {
        uint256 initialPoolPrize = 10 * 1e18;

        // Initialize the game
        hiddenPoolPrize = TFHE.asEuint64(initialPoolPrize);
        TFHE.allowThis(hiddenPoolPrize);

        countdownTimer = TFHE.asEuint256(block.timestamp + 1 days);
        TFHE.allowThis(countdownTimer);

        winner = address(0);

        lastPoolPrize = initialPoolPrize; // Pool prize of 10 ETH - demo purpose
        lastPoolPrizeTime = block.timestamp + 30 minutes; // Next time we can see the pool prize
    }

    /// Contraint on the frontend to limit the number of tokens
    /// FIXME: Need to add a limit in the smart contract!
    /// @dev Should still have a probability of failling
    function bid(einput eRequestedKeyAmount, bytes calldata inputProof) external {
        if (isGameFinished) revert GameIsFinished();

        // Check if the countdown timer is still valid
        euint256 blockTimestamp = TFHE.asEuint256(block.timestamp);
        ebool isValidTime = TFHE.le(blockTimestamp, countdownTimer);

        // Compute the price the user needs to pay
        euint64 eKeyAmount = TFHE.select(
            isValidTime,
            TFHE.asEuint64(eRequestedKeyAmount, inputProof),
            TFHE.asEuint64(0)
        );

        euint64 eKeyPrice = TFHE.asEuint64(UNIT_KEY_PRICE);
        euint64 eTotalPrice = TFHE.mul(eKeyAmount, eKeyPrice);

        // Verify enough funds from user
        ebool isTransferable = TFHE.le(eTotalPrice, _balances[msg.sender]);
        euint64 transferValue = TFHE.select(isTransferable, eTotalPrice, TFHE.asEuint64(0));

        // Update the user/pool balance
        hiddenPoolPrize = TFHE.add(hiddenPoolPrize, transferValue);
        euint64 newBalance = TFHE.sub(_balances[msg.sender], transferValue);
        _balances[msg.sender] = newBalance;
        TFHE.allowThis(hiddenPoolPrize);
        TFHE.allowThis(newBalance);
        TFHE.allow(newBalance, msg.sender);

        // Get the number of tokens bought
        euint64 keyAmount = TFHE.select(isTransferable, eKeyAmount, TFHE.asEuint64(0));

        // Update user position
        euint64 _newUserBids = TFHE.add(bids[msg.sender], keyAmount);
        bids[msg.sender] = _newUserBids;
        TFHE.allowThis(_newUserBids);
        TFHE.allow(_newUserBids, msg.sender);

        // Based on the number of token bought, increase randomly the time
        euint64 rand = TFHE.randEuint64(60);
        ebool isSelected = TFHE.gt(keyAmount, rand);
        euint256 eTimeIncrease = TFHE.asEuint256(UNIT_TIME_INCREASE);

        // Randomly increase the time
        countdownTimer = TFHE.select(
            isSelected,
            TFHE.add(countdownTimer, TFHE.mul(eTimeIncrease, rand)),
            TFHE.asEuint256(0)
        );
        TFHE.allowThis(countdownTimer);

        // Update winner position
        // ebool isNewWinner = TFHE.gt(bids[msg.sender], bids[winner]);
        TFHE.allowThis(isSelected);

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(isSelected);
        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.revealNewWinner.selector,
            0,
            block.timestamp + 100,
            false
        );
        requestedUsers[requestId] = msg.sender;
    }

    //
    // Need to think when we should reveal the end time of the pool
    //

    // - When valid (time > last time) => reveal the pool prize & update time
    // - When invalid (time < last time) => need to wait
    // - When pool finised => reveal the time and lock the pool

    // FIXME: Need to see if we have to reveal it when the game is finished
    function requestRevealPrizePool() external {
        // Check if we need to wait for revealing the prize pool
        if (block.timestamp <= lastPoolPrizeTime + UNIT_TIME_INCREASE) revert PendingTimeError();

        euint256 _now = TFHE.asEuint256(block.timestamp);

        ebool isFinished = TFHE.gt(countdownTimer, _now);
        TFHE.allowThis(isFinished);

        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(hiddenPoolPrize);
        cts[1] = Gateway.toUint256(isFinished);

        // FIXME: Should we also reveal the remaining time here?

        Gateway.requestDecryption(cts, this.revealPrizePool.selector, 0, block.timestamp + 100, false);
    }

    function claim() external {
        if (!isGameFinished) revert GameIsRunning();

        // Transfer the pool prize to the user
        euint64 newBalance = TFHE.add(_balances[msg.sender], hiddenPoolPrize);
        _balances[msg.sender] = newBalance;
        TFHE.allowThis(newBalance);
        TFHE.allow(newBalance, msg.sender);

        // Reset the pool prize - Or use a flag
        hiddenPoolPrize = TFHE.asEuint64(0);
    }

    ///
    /// Helper function
    ///

    /// @notice avoid to spend eth for wrapping - only for demo time
    function fakeWrap(uint64 _amount) public virtual {
        _unsafeMint(msg.sender, _amount);
        emit Wrap(msg.sender, _amount);
    }

    ///
    /// Gateway callback
    ///

    /// @notice Callback function to reveal the prize pool
    function revealPrizePool(
        uint256 /* requestId */,
        uint256 _lastPoolPrize,
        uint256 _isGameFinished
    ) external onlyGateway {
        lastPoolPrize = _lastPoolPrize;
        lastPoolPrizeTime = block.timestamp;

        if (_isGameFinished > 0) {
            isGameFinished = true;
        }
    }

    function revealNewWinner(uint256 requestId, uint256 _isNewWinner) external onlyGateway {
        if (_isNewWinner > 0) {
            // Update the winner
            winner = msg.sender;
            delete requestedUsers[requestId];
        }
    }
}
