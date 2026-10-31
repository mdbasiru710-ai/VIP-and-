/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Signal, LiveRoundStatus } from '../types';
import { CountdownRing } from './CountdownRing';
import { Shield, Sparkles, TrendingUp, AlertTriangle, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface SignalCardProps {
  signal: Signal | null;
  clock: LiveRoundStatus;
  onManualTrigger?: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  clock,
  onManualTrigger,
}) => {
  const { apiConfig } = useGame();

  if (!signal) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-[#999080]">
        <div className="flex justify-center mb-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent"></div>
        </div>
        <p className="text-sm">Synthesizing AI statistical probability model for next round...</p>
      </div>
    );
  }

  const isBig = signal.predictedOutcome === 'BIG';
  const isUrgent = clock.remainingSeconds <= 5;

  return (
    <div className="glass-panel-gold relative overflow-hidden rounded-2xl p-5 md:p-6 transition-all duration-300">
      {/* Decorative luxury background glow */}
      <div 
        className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl opacity-20 ${
          isBig ? 'bg-[#d4af37]' : 'bg-[#3b82f6]'
        }`} 
      />

      {/* Top row: Period & Live/Demo Status & Countdown */}
      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999080]">
              {signal.gameType === '30s' ? '30-Second Fast Signal' : '1-Minute Classic Signal'}
            </span>
            <span className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-bold tracking-wide ${
              apiConfig.mode === 'LIVE' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-[#2a2312] text-[#e0c56f] border border-[#d4af37]/30'
            }`}>
              {apiConfig.mode === 'LIVE' ? 'LIVE DATA' : 'DEMO'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-base md:text-lg font-bold text-[#ede8dc] tracking-tight">
              Period #{signal.period}
            </span>
            {isUrgent && (
              <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                BETTING LOCKED
              </span>
            )}
          </div>
        </div>

        {/* Countdown Ring */}
        <div className="flex items-center gap-3">
          <CountdownRing
            remaining={clock.remainingSeconds}
            total={clock.totalCycleSeconds}
            size={76}
            strokeWidth={5}
            label={signal.gameType}
          />
        </div>
      </div>

      {/* Centerpiece: Signal Output Badge */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Outcome Display Medallion */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#999080] mb-2">
            AI TARGET PREDICTION
          </div>

          <div
            className={`relative flex w-full max-w-[220px] flex-col items-center justify-center rounded-2xl py-4 px-6 shadow-2xl transition-all duration-300 ${
              isBig
                ? 'bg-gradient-to-b from-[#2a220e] via-[#1a1508] to-[#0d0b04] border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.25)]'
                : 'bg-gradient-to-b from-[#0f1d33] via-[#091222] to-[#050a14] border-2 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.25)]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#a8a192] mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-[#f3d878]" />
              <span>CONFIDENCE {signal.confidence}%</span>
            </div>

            <span
              className={`font-serif text-4xl md:text-5xl font-black tracking-widest ${
                isBig ? 'text-gold-gradient' : 'text-sky-300'
              }`}
            >
              {signal.predictedOutcome}
            </span>

            <span className="mt-1 text-[11px] font-mono text-[#bfb7a6]">
              {isBig ? 'Target Range: 5 · 6 · 7 · 8 · 9' : 'Target Range: 0 · 1 · 2 · 3 · 4'}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#8c8475]">Position:</span>
            <span className="rounded bg-[#1c1a14] border border-[#d4af37]/40 px-2 py-0.5 text-xs font-mono font-bold text-[#f5d77f]">
              {signal.recommendedUnit} UNIT
            </span>
          </div>
        </div>

        {/* Probability Distribution & Details */}
        <div className="md:col-span-7 flex flex-col justify-center gap-4 bg-[#090b10]/60 rounded-xl p-4 border border-white/[0.05]">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-[#f5d77f]">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                BIG: {signal.bigProbability}%
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                SMALL: {signal.smallProbability}%
              </span>
            </div>

            {/* Dual Probability Bar */}
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#151722] p-0.5 border border-white/10">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-[#ba9527] to-[#f5d77f] transition-all duration-500"
                style={{ width: `${signal.bigProbability}%` }}
              />
              <div
                className="absolute right-0 top-0.5 bottom-0.5 rounded-r-full bg-gradient-to-l from-sky-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${signal.smallProbability}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[#787163] font-mono">
              <span>0%</span>
              <span>50% EQUILIBRIUM</span>
              <span>100%</span>
            </div>
          </div>

          {/* Pattern & Rationale */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8c8475] font-medium">Model Pattern:</span>
              <span className="font-medium text-[#ede8dc]">{signal.patternDetected}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#a8a192]">
              {signal.rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Fast actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d4af37]/15 pt-3.5 text-xs text-[#8c8475]">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>Calculated from Markov state chain & Poisson sequence model</span>
        </div>

        {onManualTrigger && (
          <button
            onClick={onManualTrigger}
            className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#19150c] px-3 py-1 text-xs font-semibold text-[#f5d77f] hover:bg-[#2b2210] hover:border-[#d4af37] transition"
            title="Fast forward to instant draw resolution (Simulation tool)"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Instant Draw Test</span>
          </button>
        )}
      </div>
    </div>
  );
};
