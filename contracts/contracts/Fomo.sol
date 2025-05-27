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


    error GameIsFinished();
    error PendingTimeError();

    /// TODO: wrap direclty ETH
    constructor(
        uint256 maxDecryptionDelay_
    ) ConfidentialWETH(maxDecryptionDelay_) {
        // Initialize the game
        hiddenPoolPrize = TFHE.asEuint64(0);
        countdownTimer = TFHE.asEuint256(block.timestamp + 1 days);
        winner = address(0);

        // FIXME: removed them?
        lastPoolPrize = 0;
        lastPoolPrizeTime = block.timestamp;
    }


    function bid(
        einput eRequestedKeyAmount, 
        bytes calldata inputProof
    ) external {
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

        
        // Get the number of keys bought
        euint64 keyAmount = TFHE.select(
            isTransferable, eKeyAmount, TFHE.asEuint64(0));

        // Update user position
        bids[msg.sender] = TFHE.add(
            bids[msg.sender], 
            keyAmount
        );

        // Update the time based on the number of keys bought
        euint256 eTimeIncrease = TFHE.asEuint256(UNIT_TIME_INCREASE);
        countdownTimer = TFHE.add(
            countdownTimer, 
            TFHE.mul(eTimeIncrease, keyAmount)
        );

        // Update winner position
        ebool isNewWinner = TFHE.gt(bids[msg.sender], bids[winner]);


        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(isNewWinner);
        uint256 requestId = Gateway.requestDecryption(
            cts, 
            this.revealNewWinner.selector, 
            0,
            block.timestamp + 100, 
            false
        );
        requestedUsers[requestId] = msg.sender;


        // FIXME: How to get the winner? Call the gateway to get the winner? 

        // FIXME: If we compared hidden data, we cannot use the `winner` address directly
        // TODO:: Should we use gateway mechanism too?


    }

    // - When valid (time > last time) => reveal the pool prize & update time
    // - When invalid (time < last time) => need to wait
    // - When pool finised => reveal the time and lock the pool
    function requestRevealPrizePool() external {

        // FIXME: Need to see if we have to reveal it when the game is finished

        // Check if we need to wait for revealing the prize pool
        if (block.timestamp <= lastPoolPrizeTime + UNIT_TIME_INCREASE ) revert PendingTimeError();

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(hiddenPoolPrize);
        Gateway.requestDecryption(
            cts, 
            this.revealPrizePool.selector, 
            0,
            block.timestamp + 100, 
            false
        );
    }


    ///
    /// Gateway callback
    ///

    /// @notice Callback function to reveal the prize pool
    function revealPrizePool(uint256 /* requestId */, uint256 _lastPoolPrize) external onlyGateway {
        lastPoolPrize = _lastPoolPrize;
        lastPoolPrizeTime = block.timestamp;
    }

    function revealNewWinner(uint256 requestId, uint256 _isNewWinner) external onlyGateway {
        if (_isNewWinner > 0) {  // Update the winner
            winner = msg.sender;
            delete requestedUsers[requestId];
        }
    }

    
}
