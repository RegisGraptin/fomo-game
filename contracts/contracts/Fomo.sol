// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import { ConfidentialWETH } from "fhevm-contracts/contracts/token/ERC20/ConfidentialWETH.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Fomo is SepoliaZamaFHEVMConfig, ConfidentialWETH {

    ConfidentialERC20 erc20;

    uint64 public constant UNIT_KEY_PRICE = 1e14; // 0.0001 ETH
    uint256 public constant UNIT_TIME_INCREASE = 30 minutes;

    euint64 hiddenPoolPrize;

    euint256 countdownTimer;

    // Set the pool prize - The amount will be revealed only after a set of time
    uint256 public lastPoolPrize;
    uint256 public lastPoolPrizeTime;
    

    // Store the current winner and the amount of bids from users
    address public winner;
    mapping(address => euint64) public bids;


    /// TODO: wrap direclty ETH
    constructor(
        uint256 maxDecryptionDelay_
    ) ConfidentialWETH(maxDecryptionDelay_) {
        poolPrize = 0;
        lastPoolPrizeReveal = 0;
        winner = address(0);

        // Set the end of the game
        countdownTimer = TFHE.asEuint256(block.timestamp + 1 days);
    }


    function bid(
        einput eRequestedKeyAmount, 
        bytes calldata inputProof
    ) external {
        // Compute the price the user needs to pay
        euint64 eKeyAmount = TFHE.asEuint64(eRequestedKeyAmount, inputProof);
        euint64 eKeyPrice = TFHE.asEuint64(UNIT_KEY_PRICE);
        euint64 eTotalPrice = TFHE.mul(eKeyAmount, eKeyPrice);

        // Verify enough funds
        ebool isTransferable = TFHE.le(eTotalPrice, _balances[msg.sender]);
        euint64 transferValue = TFHE.select(isTransferable, eTotalPrice, TFHE.asEuint64(0));

        // Update the user/pool balance 
        poolPrize = TFHE.add(poolPrize, transferValue);
        euint64 newBalance = TFHE.sub(_balances[msg.sender], transferValue);
        _balances[msg.sender] = newBalance;

        
        // Get the number of keys bought
        euint256 keyAmount = TFHE.select(isTransferable, eKeyAmount, TFHE.asEuint256(0));

        // Update user position
        bids[msg.sender] = TFHE.add(
            bids[msg.sender], 
            keyAmount
        );

        // FIXME: How to get the winner? Call the gateway to get the winner? 

        // FIXME: If we compared hidden data, we cannot use the `winner` address directly
        // TODO:: Should we use gateway mechanism too?


        // Update the time based on the number of keys bought
        euint256 eTimeIncrease = TFHE.asEuint256(UNIT_TIME_INCREASE);
        countdownTimer = TFHE.add(
            countdownTimer, 
            TFHE.mul(eTimeIncrease, keyAmount)
        );

    }

    // - When valid (time > last time) => reveal the pool prize & update time
    // - When invalid (time < last time) => need to wait
    // - When pool finised => reveal the time and lock the pool
    function requestRevealPrizePool() external {
        
        // FIXME: add time check

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint64(lastPoolPrize);
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

    function revealPrizePool(uint256 /* requestId */, uint256 _lastPoolPrize) external onlyGateway {
        
        // Check if the value is valid or not
        // == 0 => end of the game?
        
        lastPoolPrize = _lastPoolPrize
        lastPoolPrizeTime = block.timestamp;
    }

    
}
