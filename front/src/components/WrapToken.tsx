"use client";

import { useState } from "react";

import { getAddress, parseUnits } from "viem";
import { useWriteContract } from "wagmi";

import Fomo from "@/abi/Fomo.json";

export default function WrapToken() {
  const [quantity, setQuantity] = useState("");

  const { writeContract } = useWriteContract();

  const mintWrapEth = async () => {
    console.log(quantity);

    // Fake wrap some ETH
    writeContract({
      address: getAddress(process.env.NEXT_PUBLIC_CONTRACT!),
      abi: Fomo.abi,
      functionName: "fakeWrap",
      args: [parseUnits(quantity, 18)],
    });
  };

  return (
    <div className="max-w-2xl mx-auto pt-5">
      {/* Quantity Selector */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-gray-900 font-semibold mb-4">Mint Free Wrap ETH</h2>
        <div className="gap-2">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mb-2 w-full flex-1 border-2 border-gray-200 rounded-lg p-3 text-center text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors"
          />

          <div className="flex flex-row space-x-2">
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-95"
              onClick={mintWrapEth}
            >
              Mint Wrap ETH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
