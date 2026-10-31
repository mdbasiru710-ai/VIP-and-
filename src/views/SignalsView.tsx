/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SignalCard } from '../components/SignalCard';
import { Zap, Clock, ShieldAlert, Filter, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const SignalsView: React.FC = () => {
  const {
    active30sSignal,
    active1mSignal,
    clock30s,
    clock1m,
    signals,
    manualDrawNow
  } = useGame();

  const [filterType, setFilterType] = useState<'ALL' | '30s' | '1m'>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(50);

  const filteredSignals = signals.filter(s => {
    if (filterType !== 'ALL' && s.gameType !== filterType) return false;
    if (s.confidence < minConfidence) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">Live VIP Signals Dashboard</h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Continuous algorithmic probability updates for 30-second and 1-minute cycles.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#090b10] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${filterType === 'ALL' ? 'bg-[#d4af37] text-black' : 'text-[#8c8475] hover:text-[#ede8dc]'}`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilterType('30s')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${filterType === '30s' ? 'bg-[#d4af37] text-black' : 'text-[#8c8475] hover:text-[#ede8dc]'}`}
            >
              30s Only
            </button>
            <button
              onClick={() => setFilterType('1m')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${filterType === '1m' ? 'bg-[#d4af37] text-black' : 'text-[#8c8475] hover:text-[#ede8dc]'}`}
            >
              1m Only
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#090b10] px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#8c8475]">
            <Filter className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Min:</span>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="bg-transparent font-mono text-[#f5d77f] font-bold focus:outline-none"
            >
              <option value={50} className="bg-[#090b10]">50%+</option>
              <option value={60} className="bg-[#090b10]">60%+</option>
              <option value={65} className="bg-[#090b10]">65%+ (High)</option>
              <option value={70} className="bg-[#090b10]">70%+ (Elite)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dual Active Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#f5d77f] uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Fast 30-Second Stream
            </span>
            <span className="font-mono text-xs text-[#8c8475]">Next Draw in {clock30s.remainingSeconds}s</span>
          </div>
          <SignalCard
            signal={active30sSignal}
            clock={clock30s}
            onManualTrigger={() => manualDrawNow('30s')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Standard 1-Minute Stream
            </span>
            <span className="font-mono text-xs text-[#8c8475]">Next Draw in {clock1m.remainingSeconds}s</span>
          </div>
          <SignalCard
            signal={active1mSignal}
            clock={clock1m}
            onManualTrigger={() => manualDrawNow('1m')}
          />
        </div>
      </div>

      {/* Recent Signal Feed Table */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-[#ede8dc]">Live Signal Feed & Verification</h2>
            <p className="text-xs text-[#8c8475]">Real-time automatic WIN / LOSS tracking on round completion</p>
          </div>
          <span className="text-xs font-mono text-[#d4af37]">{filteredSignals.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#7e7769]">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Cycle</th>
                <th className="py-2.5 px-3">AI Prediction</th>
                <th className="py-2.5 px-3">Probability</th>
                <th className="py-2.5 px-3">Actual Result</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Model Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredSignals.slice(0, 15).map((sig) => {
                const isBig = sig.predictedOutcome === 'BIG';
                const isWin = sig.status === 'WIN';
                const isLoss = sig.status === 'LOSS';
                const isPending = sig.status === 'PENDING';

                return (
                  <tr key={sig.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-mono font-semibold text-[#ede8dc]">
                      #{sig.period}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[11px] font-bold ${sig.gameType === '30s' ? 'text-[#f5d77f]' : 'text-sky-300'}`}>
                        {sig.gameType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isBig
                          ? 'bg-[#2a220e] text-[#f5d77f] border border-[#d4af37]/40'
                          : 'bg-[#0f1d33] text-sky-300 border border-sky-400/40'
                      }`}>
                        {sig.predictedOutcome} ({sig.confidence}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#bfb7a6]">
                      B: {sig.bigProbability}% · S: {sig.smallProbability}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {sig.actualNumber !== undefined ? (
                        <span className="flex items-center gap-1.5">
                          <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] text-black font-black ${
                            sig.actualOutcome === 'BIG' ? 'bg-[#f5d77f]' : 'bg-sky-400'
                          }`}>
                            {sig.actualNumber}
                          </span>
                          <span className="text-xs text-[#8c8475]">{sig.actualOutcome}</span>
                        </span>
                      ) : (
                        <span className="text-[#666155] italic">Drawing...</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isWin && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          WIN
                        </span>
                      )}
                      {isLoss && (
                        <span className="flex items-center gap-1 text-rose-400 font-mono font-bold text-[11px]">
                          <XCircle className="h-3.5 w-3.5" />
                          LOSS
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 text-[#d4af37] font-mono text-[11px] animate-pulse">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#999080] max-w-[200px] truncate">
                      {sig.patternDetected}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Probability Integrity Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0c0d14] p-4 text-xs text-[#8c8475]">
        <ShieldAlert className="h-4 w-4 shrink-0 text-[#d4af37] mt-0.5" />
        <div>
          <span className="font-semibold text-[#ede8dc]">Probabilistic Discipline Notice: </span>
          The AURA AI platform generates mathematical likelihood estimations via empirical frequency, Markov chain transitions, and run-length variance. No algorithm can guarantee 100% win rate on random draws. Always manage risk responsibly.
        </div>
      </div>
    </div>
  );
};
