"use client";

import { useLastPoolPrize, useLastPoolTime } from "@/hook/fomo";
import { countDownValue } from "@/utils/time";
import React, { useState, useEffect } from "react";
import { formatUnits, getAddress } from "viem";
import { useWriteContract } from "wagmi";
import Fomo from "@/abi/Fomo.json";
import { parseUnits } from "ethers";

export default function PoolCountdown() {
  // Fetch pool info from smart contract
  const { data: lastPoolTime } = useLastPoolTime();
  const { data: lastPoolPrize } = useLastPoolPrize();

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const [poolAmount, setPoolAmount] = useState(0);

  const { writeContract, error } = useWriteContract();

  useEffect(() => {
    setPoolAmount(lastPoolPrize as number);
  }, [lastPoolPrize]);

  // Countdown timer
  useEffect(() => {
    if (!lastPoolTime) return;
    const seconds = countDownValue(lastPoolTime as bigint);

    setTimeLeft(seconds);

    if (seconds < 0) {
      return;
    }

    setTimeLeft(seconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, lastPoolTime]);

  const revealPrizePool = () => {
    console.log("revealPrizePool");

    writeContract({
      address: getAddress(process.env.NEXT_PUBLIC_CONTRACT!),
      abi: Fomo.abi,
      functionName: "requestRevealPrizePool",
    });
  };

  // Format time display
  // TODO:
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated clock icon */}
        <div className="animate-pulse">
          <svg
            className="w-12 h-12 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Show pool prize */}
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2 opacity-80">
            Current Pool Prize
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 animate-text-glow">
              <span className="animate-fadeIn">
                🏆 {poolAmount ? formatUnits(poolAmount, 18) : ""} ETH
              </span>
            </span>
          </div>
        </div>

        {/* FIXME: */}
        {/* formatTime(timeLeft) */}

        {/* Next time pool prize reveal */}
        {timeLeft > 0 && (
          <>
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-2 opacity-80">
                Next Prize Reveals In
              </h3>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 animate-text-glow">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(1 - timeLeft / (30 * 60)) * 100}%` }}
              />
            </div>
          </>
        )}

        {timeLeft == -1 && (
          <>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
              onClick={revealPrizePool}
            >
              Reveal the prize pool
            </button>
          </>
        )}

        <div className="text-center animate-pulse-slow">
          <p className="text-sm opacity-80">
            Will you be the one to claim the pool prize?
            <span className="inline-block ml-2">🤑</span>
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="animate-bounce delay-100"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                .
              </span>
            ))}
          </div>
        </div>

        {error && <div>{error.message}</div>}
      </div>
    </div>
  );
}
