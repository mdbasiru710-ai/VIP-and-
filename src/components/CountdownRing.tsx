/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CountdownRingProps {
  remaining: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  remaining,
  total,
  size = 90,
  strokeWidth = 6,
  label = 'DRAW'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remaining / total));
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = remaining <= 5;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(212, 175, 55, 0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isUrgent ? '#ef4444' : 'url(#goldGradient)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300 ease-linear"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae58f" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#9a7618" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Countdown Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono font-bold leading-none tabular-nums tracking-tight transition-transform ${
            isUrgent ? 'scale-110 text-rose-400 animate-pulse text-2xl' : 'text-gold-gradient text-xl'
          }`}
        >
          {String(remaining).padStart(2, '0')}s
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#8b8474] font-medium mt-0.5">
          {isUrgent ? 'LOCK' : label}
        </span>
      </div>
    </div>
  );
};
