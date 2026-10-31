/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  TrendingUp, 
  Award, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  PieChart, 
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { metrics, signals } = useGame();
  const [stakeStrategy, setStakeStrategy] = useState<'FLAT' | 'DYNAMIC'>('DYNAMIC');

  const completed = signals.filter(s => s.status === 'WIN' || s.status === 'LOSS');
  const winCount = completed.filter(s => s.status === 'WIN').length;
  const lossCount = completed.filter(s => s.status === 'LOSS').length;

  // Calculate hourly distribution
  const hourlyWins = new Array(24).fill(0);
  const hourlyTotal = new Array(24).fill(0);

  completed.forEach(s => {
    const hour = new Date(s.timestamp).getHours();
    hourlyTotal[hour]++;
    if (s.status === 'WIN') hourlyWins[hour]++;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              VIP Algorithmic Performance & Analytics
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Transparent tracking of signal accuracy, streak durability, and unit-based capital returns.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090b10] p-1 rounded-xl border border-white/10 self-start sm:self-auto text-xs">
          <span className="text-[#8c8475] px-2">Staking Simulation:</span>
          <button
            onClick={() => setStakeStrategy('DYNAMIC')}
            className={`px-3 py-1 font-semibold rounded-lg transition ${
              stakeStrategy === 'DYNAMIC' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            AI Conviction (1x-2x)
          </button>
          <button
            onClick={() => setStakeStrategy('FLAT')}
            className={`px-3 py-1 font-semibold rounded-lg transition ${
              stakeStrategy === 'FLAT' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            Flat 1 Unit
          </button>
        </div>
      </div>

      {/* Hero Performance KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel-gold rounded-2xl p-5 border border-[#d4af37]/40">
          <div className="flex items-center justify-between text-xs text-[#999080] mb-1">
            <span>Overall Win Rate</span>
            <Sparkles className="h-4 w-4 text-[#f5d77f]" />
          </div>
          <div className="font-mono text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
            {metrics.winRate}%
          </div>
          <div className="mt-2 text-xs text-[#8c8475]">
            From {completed.length} resolved signals
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#999080] mb-1">
            <span>Simulated Profit P&L</span>
            <Award className="h-4 w-4 text-[#d4af37]" />
          </div>
          <div className={`font-mono text-3xl md:text-4xl font-black tracking-tight ${metrics.simulatedProfitUnits >= 0 ? 'text-[#f5d77f]' : 'text-rose-400'}`}>
            {metrics.simulatedProfitUnits >= 0 ? `+${metrics.simulatedProfitUnits}` : metrics.simulatedProfitUnits}
            <span className="text-base font-sans font-normal text-[#8c8475] ml-1">Units</span>
          </div>
          <div className="mt-2 text-xs text-[#8c8475]">
            After 4% simulated commission
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#999080] mb-1">
            <span>Longest Win Streak</span>
            <Flame className="h-4 w-4 text-[#f5d77f]" />
          </div>
          <div className="font-mono text-3xl md:text-4xl font-black text-[#f5d77f] tracking-tight">
            {metrics.maxWinStreak} <span className="text-base font-sans font-normal text-[#8c8475]">Rounds</span>
          </div>
          <div className="mt-2 text-xs text-[#8c8475]">
            Max Drawdown Streak: {metrics.maxLossStreak} rounds
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#999080] mb-1">
            <span>Current Active Run</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="font-mono text-3xl md:text-4xl font-black text-[#ede8dc] tracking-tight">
            {metrics.currentStreak > 0 ? (
              <span className="text-emerald-400">+{metrics.currentStreak} WIN</span>
            ) : metrics.currentStreak < 0 ? (
              <span className="text-rose-400">{metrics.currentStreak} LOSS</span>
            ) : (
              '0'
            )}
          </div>
          <div className="mt-2 text-xs text-[#8c8475]">
            Today's Accuracy: {metrics.todayWinRate}%
          </div>
        </div>
      </div>

      {/* Cycle Accuracy & Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Comparison */}
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="font-serif text-base font-bold text-[#ede8dc] mb-4">
            Accuracy by Timeframe Cycle
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#f5d77f]">30-Second Fast Cycle</span>
                <span className="font-mono text-emerald-400">{metrics.thirtySecWinRate}% Accuracy</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#151722] overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ba9527] to-[#f5d77f]"
                  style={{ width: `${metrics.thirtySecWinRate}%` }}
                />
              </div>
              <p className="text-[11px] text-[#787163] mt-1">
                High tempo: rapid pattern transitions, sensitive to micro-dragon streaks.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-sky-300">1-Minute Standard Cycle</span>
                <span className="font-mono text-emerald-400">{metrics.oneMinWinRate}% Accuracy</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#151722] overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  style={{ width: `${metrics.oneMinWinRate}%` }}
                />
              </div>
              <p className="text-[11px] text-[#787163] mt-1">
                Standard tempo: stable Poisson distribution and smooth Markov matrix.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-center">
            <div className="rounded-xl bg-[#090b10] p-3 border border-white/[0.04]">
              <div className="text-[10px] text-[#8c8475] uppercase">Total Verified</div>
              <div className="font-mono text-lg font-bold text-[#ede8dc] mt-0.5">{completed.length}</div>
            </div>
            <div className="rounded-xl bg-[#090b10] p-3 border border-emerald-500/20">
              <div className="text-[10px] text-emerald-400 uppercase">Successful Wins</div>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">{winCount}</div>
            </div>
            <div className="rounded-xl bg-[#090b10] p-3 border border-rose-500/20">
              <div className="text-[10px] text-rose-400 uppercase">Drawdowns</div>
              <div className="font-mono text-lg font-bold text-rose-400 mt-0.5">{lossCount}</div>
            </div>
          </div>
        </div>

        {/* Bankroll Management & Risk Discipline */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-3">
            <ShieldCheck className="h-5 w-5 text-[#d4af37]" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#ede8dc]">
                VIP Capital Management Rules
              </h2>
              <p className="text-xs text-[#8c8475]">Golden rules for mathematical survival and edge retention</p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5 rounded-xl bg-[#090b10] p-3 border border-white/[0.06]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 font-mono text-[10px] font-bold text-[#f5d77f]">
                1
              </span>
              <div>
                <span className="font-bold text-[#ede8dc]">1-2% Bankroll Limit: </span>
                <span className="text-[#a8a192]">Never allocate more than 1x or 2x base units on any single signal regardless of perceived confidence.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-[#090b10] p-3 border border-white/[0.06]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 font-mono text-[10px] font-bold text-[#f5d77f]">
                2
              </span>
              <div>
                <span className="font-bold text-[#ede8dc]">Stop-Loss Discipline: </span>
                <span className="text-[#a8a192]">If 3 consecutive losses occur, the system automatically suggests taking a 10-round observation pause to wait for entropy recalibration.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-[#090b10] p-3 border border-white/[0.06]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 font-mono text-[10px] font-bold text-[#f5d77f]">
                3
              </span>
              <div>
                <span className="font-bold text-[#ede8dc]">Take-Profit Target: </span>
                <span className="text-[#a8a192]">Secure session profits once a +10 to +15 unit target is reached. Consistent daily increments compound significantly over time.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
