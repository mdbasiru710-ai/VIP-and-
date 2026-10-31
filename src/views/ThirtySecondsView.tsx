/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import { SignalCard } from '../components/SignalCard';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { Clock, Zap, TrendingUp, Award, Flame, Play } from 'lucide-react';

export const ThirtySecondsView: React.FC = () => {
  const {
    active30sSignal,
    clock30s,
    results,
    signals,
    metrics,
    manualDrawNow
  } = useGame();

  const results30s = results.filter(r => r.gameType === '30s');
  const signals30s = signals.filter(s => s.gameType === '30s');

  const wins30s = signals30s.filter(s => s.status === 'WIN').length;
  const losses30s = signals30s.filter(s => s.status === 'LOSS').length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#f5d77f] font-mono font-bold text-xs">
              30s
            </span>
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              30-Second Fast Analysis System
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Rapid high-frequency statistical cycle with accelerated Markov probability calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#16140e] px-3 py-1.5 text-xs font-mono font-bold text-[#f5d77f]">
            <Clock className="h-3.5 w-3.5" />
            <span>COUNTDOWN: {clock30s.remainingSeconds}s</span>
          </div>

          <button
            onClick={() => manualDrawNow('30s')}
            className="flex items-center gap-1.5 rounded-lg border border-[#d4af37] bg-[#221c10] px-3 py-1.5 text-xs font-bold text-[#f5d77f] hover:bg-[#332a18] transition"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Instant Draw</span>
          </button>
        </div>
      </div>

      {/* Main Signal Display */}
      <SignalCard
        signal={active30sSignal}
        clock={clock30s}
        onManualTrigger={() => manualDrawNow('30s')}
      />

      {/* Quick 30s Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-[#8c8475] mb-1">30s Win Rate</div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {metrics.thirtySecWinRate}%
          </div>
          <div className="text-[10px] text-[#787163] mt-0.5">
            {wins30s} Wins / {losses30s} Losses
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-[#8c8475] mb-1">Active Cycle Round</div>
          <div className="font-mono text-lg font-bold text-[#f5d77f] truncate">
            #{clock30s.currentPeriod}
          </div>
          <div className="text-[10px] text-[#787163] mt-0.5">
            Sequence in 24h cycle
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-[#8c8475] mb-1">Cycle Duration</div>
          <div className="font-mono text-2xl font-bold text-[#ede8dc]">
            30.0 <span className="text-sm font-normal text-[#8c8475]">sec</span>
          </div>
          <div className="text-[10px] text-[#787163] mt-0.5">
            120 rounds per hour
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-[#8c8475] mb-1">Model State</div>
          <div className="font-mono text-sm font-bold text-sky-400">
            ACCELERATED
          </div>
          <div className="text-[10px] text-[#787163] mt-0.5">
            Real-time Markov chain
          </div>
        </div>
      </div>

      {/* Bead Roadmap for 30s */}
      <RoadmapGrid
        results={results30s}
        title="30-Second Fast Game Bead Roadmap"
      />

      {/* 30s Results & Signals Table */}
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="font-serif text-base font-bold text-[#ede8dc] mb-3">
          30-Second Historical Draws & Signal Audits
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#7e7769]">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Drawn Number</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Color</th>
                <th className="py-2.5 px-3">AI Prediction</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Audit Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {results30s.slice(0, 12).map((res) => {
                const sig = signals30s.find(s => s.period === res.period);
                const isBig = res.outcome === 'BIG';
                const isWin = sig && sig.status === 'WIN';
                const isLoss = sig && sig.status === 'LOSS';

                return (
                  <tr key={res.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#ede8dc]">
                      #{res.period}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-black font-black text-xs ${
                        isBig ? 'bg-[#f5d77f]' : 'bg-sky-400'
                      }`}>
                        {res.number}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#ede8dc]">
                      {res.outcome}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#bfb7a6]">
                      {res.color}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {sig ? (
                        <span className={sig.predictedOutcome === 'BIG' ? 'text-[#f5d77f]' : 'text-sky-300'}>
                          {sig.predictedOutcome}
                        </span>
                      ) : (
                        <span className="text-[#666155]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#bfb7a6]">
                      {sig ? `${sig.confidence}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {isWin && <span className="text-emerald-400">WIN</span>}
                      {isLoss && <span className="text-rose-400">LOSS</span>}
                      {!sig && <span className="text-[#666155]">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
