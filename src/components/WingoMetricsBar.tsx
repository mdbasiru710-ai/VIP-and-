/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModePerformanceMetrics } from '../types';
import { TrendingUp, Flame, Award, Target, CheckCircle2, XCircle } from 'lucide-react';

interface WingoMetricsBarProps {
  metrics: ModePerformanceMetrics;
  mode: '30s' | '1m';
}

export const WingoMetricsBar: React.FC<WingoMetricsBarProps> = ({ metrics, mode }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Actual Win Ratio with 70% Target Benchmark */}
      <div className="glass-panel-gold rounded-xl p-3.5 transition hover:border-[#d4af37]/60">
        <div className="flex items-center justify-between text-[11px] text-[#8c8475] mb-1">
          <span>Actual Win Ratio ({mode})</span>
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-mono text-2xl font-black text-emerald-400">
            {metrics.winRate}%
          </div>
          <span className="text-[10px] text-[#8c8475]">all-time</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-[#bfb7a6] font-mono border-t border-white/[0.04] pt-1">
          <span>Target: <strong className="text-[#f5d77f]">70% (Exp)</strong></span>
          <span>Rolling 100: <strong className="text-emerald-400">{metrics.rolling100WinRate}%</strong></span>
        </div>
      </div>

      {/* 2. Total Wins vs Losses */}
      <div className="glass-panel rounded-xl p-3.5 transition hover:border-[#d4af37]/40">
        <div className="flex items-center justify-between text-[11px] text-[#8c8475] mb-1">
          <span>Settled Predictions Audit</span>
          <Target className="h-3.5 w-3.5 text-[#f5d77f]" />
        </div>
        <div className="flex items-center gap-3 font-mono text-lg font-bold">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {metrics.totalWins} W
          </span>
          <span className="text-[#666155]">/</span>
          <span className="flex items-center gap-1 text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            {metrics.totalLosses} L
          </span>
        </div>
        <div className="text-[10px] text-[#787163] mt-1">
          {metrics.totalPredictions} Total Matched Signals
        </div>
      </div>

      {/* 3. Current Active Streak */}
      <div className="glass-panel rounded-xl p-3.5 transition hover:border-[#d4af37]/40">
        <div className="flex items-center justify-between text-[11px] text-[#8c8475] mb-1">
          <span>Current Streak</span>
          <Flame className="h-3.5 w-3.5 text-[#f5d77f]" />
        </div>
        <div className="font-mono text-2xl font-black text-[#f5d77f]">
          {metrics.currentStreak > 0 ? (
            <span className="text-emerald-400">+{metrics.currentStreak} WIN</span>
          ) : metrics.currentStreak < 0 ? (
            <span className="text-rose-400">{metrics.currentStreak} LOSS</span>
          ) : (
            '0'
          )}
        </div>
        <div className="text-[10px] text-[#787163] mt-0.5">
          Active unbroken run
        </div>
      </div>

      {/* 4. Longest Win Streak */}
      <div className="glass-panel rounded-xl p-3.5 transition hover:border-[#d4af37]/40">
        <div className="flex items-center justify-between text-[11px] text-[#8c8475] mb-1">
          <span>Max Win Streak</span>
          <Award className="h-3.5 w-3.5 text-[#d4af37]" />
        </div>
        <div className="font-mono text-2xl font-black text-[#ede8dc]">
          {metrics.maxWinStreak} <span className="text-xs font-normal text-[#8c8475]">Rounds</span>
        </div>
        <div className="text-[10px] text-[#787163] mt-0.5">
          Best consecutive win record
        </div>
      </div>
    </div>
  );
};
