/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AiAnalysisEngine } from '../services/aiAnalysis';
import { 
  Cpu, 
  TrendingUp, 
  Activity, 
  Flame, 
  Snowflake, 
  ShieldAlert, 
  BarChart3, 
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

export const AiAnalysisView: React.FC = () => {
  const { results, active30sSignal, active1mSignal } = useGame();
  const [activeCycle, setActiveCycle] = useState<'30s' | '1m'>('30s');

  const filteredHistory = results.filter(r => r.gameType === activeCycle);
  const markov = AiAnalysisEngine.calculateMarkovMatrix(filteredHistory);
  const numberFreqs = AiAnalysisEngine.calculateNumberFrequencies(filteredHistory);

  // Big vs Small breakdown
  const totalRounds = filteredHistory.length || 1;
  const bigCount = filteredHistory.filter(r => r.outcome === 'BIG').length;
  const smallCount = filteredHistory.filter(r => r.outcome === 'SMALL').length;
  const bigPercent = Math.round((bigCount / totalRounds) * 1000) / 10;
  const smallPercent = Math.round((smallCount / totalRounds) * 1000) / 10;

  // Active signal for current cycle
  const currentSignal = activeCycle === '30s' ? active30sSignal : active1mSignal;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              AI Statistical & Markov Analysis Laboratory
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Empirical probability matrices, dragon trend regression, and discrete frequency distributions.
          </p>
        </div>

        {/* Cycle Toggle */}
        <div className="flex items-center bg-[#090b10] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveCycle('30s')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeCycle === '30s'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            30s Fast Engine
          </button>
          <button
            onClick={() => setActiveCycle('1m')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeCycle === '1m'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            1m Standard Engine
          </button>
        </div>
      </div>

      {/* AI Intelligence Commentary Card */}
      <div className="glass-panel-gold rounded-2xl p-5 md:p-6 border border-[#d4af37]/40">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f5d77f] mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Real-Time AI Model Synthesis & Advisory</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#ede8dc]">
              {currentSignal ? currentSignal.patternDetected : 'Synthesizing Pattern Matrix'}
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-[#bfb7a6]">
              {currentSignal?.rationale || 'Calculating rolling sequence entropy...'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 rounded-md bg-[#1d1911] border border-[#d4af37]/30 px-2.5 py-1 text-[#f5d77f] font-mono font-bold">
                Target: {currentSignal?.predictedOutcome}
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-[#161722] border border-sky-500/30 px-2.5 py-1 text-sky-300 font-mono">
                Model Conviction: {currentSignal?.confidence}%
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[#999080]">
                Suggested Stake: {currentSignal?.recommendedUnit}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl bg-[#090b10]/90 p-4 border border-white/[0.06]">
            <div className="text-[11px] font-bold text-[#8c8475] uppercase tracking-wider mb-2">
              Model Equilibrium Status
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#f5d77f]">BIG (5-9): {bigPercent}%</span>
                  <span className="text-sky-300">SMALL (0-4): {smallPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                  <div style={{ width: `${bigPercent}%` }} className="bg-[#d4af37]" />
                  <div style={{ width: `${smallPercent}%` }} className="bg-sky-400" />
                </div>
              </div>
              <p className="text-[10px] text-[#787163] leading-normal">
                {Math.abs(bigPercent - smallPercent) < 6
                  ? 'Sequence is currently well-balanced near theoretical 50.0% parity.'
                  : `Moderate ${bigPercent > smallPercent ? 'BIG' : 'SMALL'} clustering detected. Mean reversion probability elevated.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Markov Transition Matrix & State Probabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Markov Transition Grid */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[#ede8dc]">
                1st Order Markov Chain Transition Matrix
              </h2>
              <p className="text-xs text-[#8c8475]">Empirical conditional probability P(Next | Current)</p>
            </div>
            <Layers className="h-4 w-4 text-[#d4af37]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#090b10] border border-[#d4af37]/30 transition hover:border-[#d4af37]">
              <div className="text-[11px] text-[#8c8475] font-mono">P(BIG → BIG)</div>
              <div className="font-mono text-2xl font-bold text-[#f5d77f] my-1">
                {markov.bigToBig}%
              </div>
              <div className="text-[10px] text-[#787163]">Streak continuation likelihood</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090b10] border border-sky-500/30 transition hover:border-sky-400">
              <div className="text-[11px] text-[#8c8475] font-mono">P(BIG → SMALL)</div>
              <div className="font-mono text-2xl font-bold text-sky-400 my-1">
                {markov.bigToSmall}%
              </div>
              <div className="text-[10px] text-[#787163]">Big-to-Small reversal rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090b10] border border-sky-500/30 transition hover:border-sky-400">
              <div className="text-[11px] text-[#8c8475] font-mono">P(SMALL → BIG)</div>
              <div className="font-mono text-2xl font-bold text-sky-400 my-1">
                {markov.smallToBig}%
              </div>
              <div className="text-[10px] text-[#787163]">Small-to-Big reversal rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090b10] border border-[#d4af37]/30 transition hover:border-[#d4af37]">
              <div className="text-[11px] text-[#8c8475] font-mono">P(SMALL → SMALL)</div>
              <div className="font-mono text-2xl font-bold text-[#f5d77f] my-1">
                {markov.smallToSmall}%
              </div>
              <div className="text-[10px] text-[#787163]">Streak continuation likelihood</div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#8c8475] bg-[#0c0d14] p-2.5 rounded-lg border border-white/[0.04]">
            Computed dynamically from the last {filteredHistory.length} verified rounds in local database.
          </div>
        </div>

        {/* Dragon Streak & Pattern Recognizer */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[#ede8dc]">
                Pattern Classifier & Volatility Engine
              </h2>
              <p className="text-xs text-[#8c8475]">Automated scanning across 5 standard lottery topologies</p>
            </div>
            <Activity className="h-4 w-4 text-[#f5d77f]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
              <div>
                <span className="font-bold text-xs text-[#ede8dc]">Dragon Streak Topology</span>
                <p className="text-[11px] text-[#8c8475]">Consecutive 3+ identical outcome runs</p>
              </div>
              <span className="font-mono font-bold text-xs text-emerald-400">ACTIVE DETECTOR</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
              <div>
                <span className="font-bold text-xs text-[#ede8dc]">Ping-Pong Alternation</span>
                <p className="text-[11px] text-[#8c8475]">High-frequency B-S-B-S oscillation</p>
              </div>
              <span className="font-mono font-bold text-xs text-sky-400">MONITORED</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
              <div>
                <span className="font-bold text-xs text-[#ede8dc]">Twin Pair / Double Jump</span>
                <p className="text-[11px] text-[#8c8475]">BB-SS-BB cadence structure</p>
              </div>
              <span className="font-mono font-bold text-xs text-[#bfb7a6]">STANDBY</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
              <div>
                <span className="font-bold text-xs text-[#ede8dc]">Gaussian Mean Reversion</span>
                <p className="text-[11px] text-[#8c8475]">Extreme skew threshold (&gt;2.0 sigma)</p>
              </div>
              <span className="font-mono font-bold text-xs text-[#d4af37]">OPTIMIZED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Number Frequency Distribution (0 through 9) */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-[#ede8dc]">
              Number Frequency Heatmap & Distribution (0 - 9)
            </h2>
            <p className="text-xs text-[#8c8475]">
              Identifies over-represented hot clusters and under-represented cold digits
            </p>
          </div>
          <BarChart3 className="h-4 w-4 text-[#d4af37]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {numberFreqs.map((item) => {
            const isBig = item.number >= 5;
            return (
              <div
                key={item.number}
                className={`flex flex-col items-center justify-center p-3 rounded-xl bg-[#090b10] border transition-all ${
                  item.isHot
                    ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : item.isCold
                    ? 'border-cyan-500/40'
                    : 'border-white/[0.06]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-black shadow-md ${
                    isBig
                      ? 'bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-[#120e05]'
                      : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white'
                  }`}
                >
                  {item.number}
                </div>

                <div className="mt-2 text-center">
                  <div className="font-mono text-xs font-bold text-[#ede8dc]">
                    {item.count} <span className="text-[10px] text-[#787163]">hits</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#bfb7a6]">
                    {item.percentage}%
                  </div>
                </div>

                {item.isHot && (
                  <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-amber-400">
                    <Flame className="h-2.5 w-2.5" /> HOT
                  </span>
                )}
                {item.isCold && (
                  <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-cyan-400">
                    <Snowflake className="h-2.5 w-2.5" /> COLD
                  </span>
                )}
                {!item.isHot && !item.isCold && (
                  <span className="mt-1 text-[9px] text-[#6e685c]">NORMAL</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
