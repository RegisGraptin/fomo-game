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

    euint64 poolPrize;

    // Set the pool prize - The amount will be revealed only after a set of time
    uint256 public poolPrize;
    uint256 public lastPoolPrizeReveal;
    

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

        // Update winner position 
        // FIXME: If we compared hidden data, we cannot use the `winner` address directly
        // TODO:: Should we use gateway mechanism too?

    }


    ///
    /// Gateway callback
    ///

    function executeRound(uint256 /* requestId */, uint256 _lastPoolPrize) external onlyGateway {
        lastPoolPrizeReveal = _lastPoolPrize

    }

    
}
