"use client";

import React, { useState, useEffect } from 'react';

export default function PoolCountdown() {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showPool, setShowPool] = useState(false);
  const [poolAmount] = useState(42.2); // Mock ETH amount

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowPool(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        {/* Countdown text */}
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2 opacity-80">
            {showPool ? 'Prize Revealed!' : 'Next Prize Reveals In'}
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 animate-text-glow">
              {showPool ? (
                <span className="animate-fadeIn">🏆 {poolAmount} ETH</span>
              ) : (
                formatTime(timeLeft)
              )}
            </span>
          </div>
        </div>

        {/* Mystery progress bar */}
        {!showPool && (
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(1 - timeLeft / (30 * 60)) * 100}%` }}
            />
          </div>
        )}

        {/* Curiosity text */}
        {!showPool && (
          <div className="text-center animate-pulse-slow">
            <p className="text-sm opacity-80">
              Will you be the one to claim the hidden treasure? 
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
        )}
      </div>
    </div>
  );
}