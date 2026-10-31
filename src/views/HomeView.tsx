/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SignalCard } from '../components/SignalCard';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { 
  Zap, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Radio, 
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    active30sSignal,
    active1mSignal,
    clock30s,
    clock1m,
    metrics,
    results,
    signals,
    manualDrawNow,
    setActiveTab,
    apiConfig
  } = useGame();

  const [selectedGame, setSelectedGame] = useState<'30s' | '1m'>('30s');

  const activeSignal = selectedGame === '30s' ? active30sSignal : active1mSignal;
  const activeClock = selectedGame === '30s' ? clock30s : clock1m;

  const filteredResults = results.filter(r => r.gameType === selectedGame);
  const recentRounds = results.slice(0, 10);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* VIP Welcome & Status Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#17140e] via-[#0d0e14] to-[#07080b] p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-0.5 text-xs font-bold text-[#f5d77f]">
                <Sparkles className="h-3 w-3" />
                VIP INTELLIGENCE PLATFORM
              </span>
              <span className="text-xs text-[#8c8475]">v3.8 Multi-Cycle Core</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-wide text-gold-gradient">
              AI Big / Small Signal Engine
            </h1>
            <p className="text-xs md:text-sm text-[#aba392] max-w-2xl leading-relaxed">
              Real-time statistical regression, Markov chain transition matrices, and dragon streak pattern detection. Mathematically validated probabilities without fake promises.
            </p>
          </div>

          {/* Quick Cycle Switcher */}
          <div className="flex items-center gap-1.5 bg-[#090b10] p-1.5 rounded-xl border border-white/10 self-start md:self-center">
            <button
              onClick={() => setSelectedGame('30s')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                selectedGame === '30s'
                  ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'text-[#9c9484] hover:text-[#ede8dc]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>30-Second Fast</span>
              <span className="rounded bg-black/20 px-1 py-0.2 text-[10px] font-mono">
                {clock30s.remainingSeconds}s
              </span>
            </button>

            <button
              onClick={() => setSelectedGame('1m')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                selectedGame === '1m'
                  ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'text-[#9c9484] hover:text-[#ede8dc]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>1-Minute Standard</span>
              <span className="rounded bg-black/20 px-1 py-0.2 text-[10px] font-mono">
                {clock1m.remainingSeconds}s
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Signal Card */}
      <SignalCard
        signal={activeSignal}
        clock={activeClock}
        onManualTrigger={() => manualDrawNow(selectedGame)}
      />

      {/* VIP Performance Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-panel rounded-xl p-4 transition hover:border-[#d4af37]/40">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Overall Accuracy</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400 tracking-tight">
            {metrics.winRate}%
          </div>
          <div className="text-[11px] text-[#787163] mt-1">
            {metrics.totalWins} Wins / {metrics.totalLosses} Losses
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 transition hover:border-[#d4af37]/40">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Current Streak</span>
            <Flame className="h-3.5 w-3.5 text-[#f5d77f]" />
          </div>
          <div className="font-mono text-2xl font-black text-[#f5d77f] tracking-tight">
            {metrics.currentStreak > 0 ? `+${metrics.currentStreak} WIN` : metrics.currentStreak < 0 ? `${metrics.currentStreak} LOSS` : '0'}
          </div>
          <div className="text-[11px] text-[#787163] mt-1">
            Max Win Streak: {metrics.maxWinStreak}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 transition hover:border-[#d4af37]/40">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Simulated Profit</span>
            <Award className="h-3.5 w-3.5 text-[#d4af37]" />
          </div>
          <div className={`font-mono text-2xl font-black tracking-tight ${metrics.simulatedProfitUnits >= 0 ? 'text-[#f5d77f]' : 'text-rose-400'}`}>
            {metrics.simulatedProfitUnits >= 0 ? `+${metrics.simulatedProfitUnits}` : metrics.simulatedProfitUnits} <span className="text-sm font-sans font-normal text-[#8c8475]">Units</span>
          </div>
          <div className="text-[11px] text-[#787163] mt-1">
            Flat 1x/2x unit discipline
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 transition hover:border-[#d4af37]/40">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Cycle Accuracy</span>
            <Zap className="h-3.5 w-3.5 text-[#38bdf8]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#ede8dc] tracking-tight">
            <span className="text-[#f5d77f]">{metrics.thirtySecWinRate}%</span> <span className="text-xs text-[#6e685c]">30s</span> · <span className="text-sky-300">{metrics.oneMinWinRate}%</span> <span className="text-xs text-[#6e685c]">1m</span>
          </div>
          <div className="text-[11px] text-[#787163] mt-1">
            {metrics.totalSignals} Total Signals Generated
          </div>
        </div>
      </div>

      {/* Visual Bead Roadmap */}
      <RoadmapGrid
        results={filteredResults}
        title={`${selectedGame === '30s' ? '30-Second Fast' : '1-Minute Classic'} Big Road Sequence`}
      />

      {/* Recent Live Draws Tape */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-[#ede8dc]">Recent Game Result History</span>
            <span className="text-xs text-[#8c8475]">· Real verified outcomes</span>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-1 text-xs font-semibold text-[#f5d77f] hover:underline"
          >
            <span>Full History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {recentRounds.map((round) => {
            const isBig = round.outcome === 'BIG';
            // Find corresponding signal
            const sig = signals.find(s => s.period === round.period && s.gameType === round.gameType);
            const isWin = sig && sig.status === 'WIN';
            const isLoss = sig && sig.status === 'LOSS';

            return (
              <div
                key={round.id}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#090b10] border border-white/[0.06] hover:border-[#d4af37]/40 transition"
              >
                <span className="font-mono text-[9px] text-[#787163]">
                  ...{round.period.slice(-4)}
                </span>

                <div
                  className={`my-1.5 flex h-9 w-9 items-center justify-center rounded-full font-mono text-base font-black shadow-md ${
                    isBig
                      ? 'bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-[#120e05]'
                      : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white'
                  }`}
                >
                  {round.number}
                </div>

                <span className="text-[10px] font-bold tracking-wider text-[#bfb7a6]">
                  {round.outcome}
                </span>

                {sig && (
                  <span
                    className={`mt-1 rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                      isWin
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : isLoss
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isWin ? 'WIN' : isLoss ? 'LOSS' : 'PENDING'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live API Integration Notice Banner */}
      {apiConfig.mode === 'DEMO' && (
        <div className="rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#17140e] to-[#0c0d12] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#262013] text-[#f5d77f] border border-[#d4af37]/30">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-[#f5d77f]">Currently Running on High-Fidelity Demo Simulation</p>
              <p className="text-[#8c8475]">Connect your authorized game provider API endpoint in Settings to pull live real-time draws.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-[#d4af37] bg-[#221c10] px-4 py-2 font-bold text-[#f5d77f] hover:bg-[#332a18] transition"
          >
            <span>Configure Live API</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
