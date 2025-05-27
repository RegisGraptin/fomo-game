"use client";

import { useState } from "react";

import { FaKey } from "react-icons/fa";


export default function BiddingInterface() {
  const [quantity, setQuantity] = useState(1);
  // ... (keep existing state)

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* ... (keep existing winner and transactions sections) */}

      {/* Quantity Selector */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-gray-900 font-semibold mb-4">Buy Keys</h2>
        <div className="gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="mb-2 w-full flex-1 border-2 border-gray-200 rounded-lg p-3 text-center text-gray-800 font-bold focus:outline-none focus:border-blue-500 transition-colors"
          />

          <div className="flex flex-row space-x-2">
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-semibold"
            >
                <FaKey className="inline mr-2" />
              1 Key
            </button>
            <button
              onClick={() => setQuantity(quantity + 10)}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-semibold"
            >
                <FaKey className="inline mr-2" />
              10 Keys
            </button>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105">
        Place Bid
      </button>
    </div>
  );
}