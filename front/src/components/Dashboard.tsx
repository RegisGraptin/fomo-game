import React from 'react';
import BiddingInterface from './BiddingInterface';

import { FaCrown } from "react-icons/fa";
import PoolCountdown from './PoolCountdown';

interface Transaction {
  txHash: string;
  address: string;
  amount: string;
  multiplier: number;
  timestamp: string;
}

export default function Dashboard() {

  // FIXME: Fetch on chain event data

  // Mock data - replace with real data from your contract
  const winnerAddress = '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7';
  const transactions: Transaction[] = [
    {
      txHash: '0x4a7b...e3c1',
      address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
      amount: '1.5 ETH',
      multiplier: 1.8,
      timestamp: '2 min ago'
    },
    {
      txHash: '0x5c8d...f9a2',
      address: '0x3dC5...8F1e',
      amount: '0.8 ETH',
      multiplier: 1.5,
      timestamp: '5 min ago'
    },
    {
      txHash: '0x1f3a...b7c4',
      address: '0xA1b3...9Ef5',
      amount: '2.1 ETH',
      multiplier: 2.2,
      timestamp: '10 min ago'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      
      <PoolCountdown />

      {/* Winner Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 mt-3">
        <h2 className="flex justify-align items-center text-gray-500 text-sm font-semibold mb-2">
            <FaCrown />
            <span className="ml-2">Current Winner</span>
        </h2>
        <div className="flex items-center">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-mono">
            {winnerAddress}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-200 mb-4">Recent Bids</h2>
        {transactions.map((tx) => (
          <div
            key={tx.txHash}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">{tx.address}</div>
                <div className="text-sm text-gray-500">{tx.timestamp}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm">
                    {tx.multiplier}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      

      {/* TODO: Need another input to buy key - maybe have a button on the side to buy 1 key or 10 keys */}
      <BiddingInterface />

    </div>
  );
}