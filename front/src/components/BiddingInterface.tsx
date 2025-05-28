"use client";

import { getFHEInstance } from "@/lib/fhe";
import { useState } from "react";

import { getAddress, toHex } from "viem";
import { useAccount, useWriteContract } from "wagmi";

import Fomo from "@/abi/Fomo.json";
import { GiToken } from "react-icons/gi";

export default function BiddingInterface() {
  const [quantity, setQuantity] = useState(1);

  const { address: userAddress } = useAccount();
  const { writeContract } = useWriteContract();

  const buyKeys = async () => {
    // Get the FHE instance
    console.log("Retrieve FHE Instance");
    const instance = getFHEInstance();

    if (!instance) {
      console.log("Instance loading...");
      return;
    }

    const input = instance.createEncryptedInput(
      process.env.NEXT_PUBLIC_CONFIDENTIAL_LAYER_ADDRESS!,
      "" + userAddress
    );

    // Add the user entry depending of the selected value
    input.add64(Math.min(quantity, 50));
    const encryptedInputs = await input.encrypt();

    writeContract({
      address: getAddress(process.env.NEXT_PUBLIC_CONTRACT!),
      abi: Fomo.abi,
      functionName: "bid",
      args: [
        toHex(encryptedInputs.handles[0]),
        toHex(encryptedInputs.inputProof),
      ],
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quantity Selector */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-gray-900 font-semibold mb-2">Buy Tokens</h2>
        <p className="text-gray-600 mb-2">
          Get a probability of winning & increasing the timer
        </p>
        <div className="gap-2">
          <input
            type="number"
            min="1"
            max={50}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="mb-2 w-full flex-1 border-2 border-gray-200 rounded-lg p-3 text-center text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors"
          />

          <div className="flex flex-row space-x-2">
            <button
              onClick={() => setQuantity(Math.min(quantity + 1, 50))}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-semibold"
            >
              <GiToken className="inline mr-2" />1 Token
            </button>
            <button
              onClick={() => setQuantity(Math.min(quantity + 10, 50))}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-semibold"
            >
              <GiToken className="inline mr-2" />
              10 Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <button
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
        onClick={buyKeys}
      >
        Buy tokens
      </button>
    </div>
  );
}
