/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WingoPrediction, MultiWindowAnalysis } from '../types';
import { CountdownRing } from './CountdownRing';
import { Sparkles, Shield, AlertTriangle, Layers, Clock, Lock, Cpu, EyeOff, BarChart2 } from 'lucide-react';
import { useWingo } from '../context/WingoContext';

interface ActiveWingoPredictionCardProps {
  currentIssueNumber: string;
  serverRemainingSeconds: number;
  totalCycleSeconds: number;
  isLocked: boolean;
  prediction: WingoPrediction | null;
  mode: '30s' | '1m';
}

export const ActiveWingoPredictionCard: React.FC<ActiveWingoPredictionCardProps> = ({
  currentIssueNumber,
  serverRemainingSeconds,
  totalCycleSeconds,
  isLocked,
  prediction,
  mode
}) => {
  const { windowSize, setWindowSize, currentMultiWindowAnalysis, currentModeState } = useWingo();

  const isBig = prediction?.predictedOutcome === 'BIG';
  const isSmall = prediction?.predictedOutcome === 'SMALL';
  const isNoSignal = prediction?.predictedOutcome === 'NO_SIGNAL';

  // Current active window data
  const winData = windowSize === 500 
    ? currentMultiWindowAnalysis?.w500 
    : windowSize === 200 
    ? currentMultiWindowAnalysis?.w200 
    : currentMultiWindowAnalysis?.w100;

  return (
    <div className="glass-panel-gold relative overflow-hidden rounded-2xl p-5 md:p-6 border border-[#d4af37]/40 shadow-2xl">
      {/* Decorative ambient background */}
      <div 
        className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl opacity-20 ${
          isBig ? 'bg-[#d4af37]' : isSmall ? 'bg-sky-500' : 'bg-amber-700'
        }`} 
      />

      {/* Top Header: Exact API Issue & Server Authoritative Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              EXACT API ISSUE SYNCHRONIZED
            </span>
            <span className="font-mono text-xs text-[#8c8475]">
              WinGo {mode === '30s' ? '30s' : '1 Min'}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#a8a192]">Target Draw:</span>
            <span className="font-mono text-lg md:text-xl font-black text-gold-gradient tracking-tight bg-black/40 px-2.5 py-0.5 rounded-lg border border-[#d4af37]/30">
              #{currentIssueNumber}
            </span>
          </div>
        </div>

        {/* Server Countdown Ring */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-[#8c8475] tracking-wider">
              SERVER COUNTDOWN
            </div>
            <div className="font-mono text-xs text-[#d4af37]">
              {isLocked ? 'ROUND CLOSING' : 'OPEN FOR BETS'}
            </div>
          </div>
          <CountdownRing
            remaining={serverRemainingSeconds}
            total={totalCycleSeconds}
            size={74}
            strokeWidth={5}
            label={isLocked ? 'LOCK' : 'DRAW'}
          />
        </div>
      </div>

      {/* Multi-Window Sample Size Selector */}
      <div className="my-3 flex flex-wrap items-center justify-between gap-2 bg-[#090b10]/80 p-2 rounded-xl border border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-[#f5d77f]" />
          <span className="text-[#8c8475] font-medium text-[11px]">Analysis Depth Window:</span>
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
            {([100, 200, 500] as const).map(size => (
              <button
                key={size}
                onClick={() => setWindowSize(size)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                  windowSize === size
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-[#8c8475] hover:text-[#ede8dc]'
                }`}
              >
                {size} Draws
              </button>
            ))}
          </div>
        </div>

        {winData && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#a8a192]">
            <span>BIG: <strong className="text-[#f5d77f]">{winData.bigPct}%</strong></span>
            <span>SMALL: <strong className="text-sky-400">{winData.smallPct}%</strong></span>
            <span>Z-Score: <strong className={Math.abs(winData.zScore) >= 1.65 ? 'text-amber-400' : 'text-[#8c8475]'}>{winData.zScore > 0 ? `+${winData.zScore}` : winData.zScore}σ</strong></span>
          </div>
        )}
      </div>

      {/* Locked Notice */}
      {isLocked && (
        <div className="my-2.5 flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 p-2 text-xs font-bold text-amber-300 animate-pulse">
          <Lock className="h-3.5 w-3.5" />
          <span>Server countdown has locked final 5s. Awaiting official settled result.</span>
        </div>
      )}

      {/* Center AI Target Prediction Medallion */}
      {prediction ? (
        <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Outcome Medallion / NO SIGNAL Badge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8c8475] mb-1.5 flex items-center gap-1.5">
              <span>STATISTICAL SIGNAL FOR #{prediction.targetIssueNumber.slice(-4)}</span>
            </div>

            {isNoSignal ? (
              <div className="relative flex w-full max-w-[220px] flex-col items-center justify-center rounded-2xl py-5 px-4 bg-gradient-to-b from-[#241a0b] via-[#161208] to-[#0c0904] border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-amber-400 mb-1">
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>LOW CONVICTION</span>
                </div>

                <span className="font-serif text-3xl font-black tracking-widest text-amber-300 my-1">
                  NO SIGNAL
                </span>

                <span className="text-[10px] font-mono font-bold text-[#f5d77f] bg-black/60 px-2 py-0.5 rounded border border-amber-500/30 mt-1">
                  PASS / OBSERVE
                </span>

                <span className="mt-2 text-[10px] text-center text-[#a8a192] leading-tight">
                  Entropy near 50/50 equilibrium. Model avoids forced bets.
                </span>
              </div>
            ) : (
              <div
                className={`relative flex w-full max-w-[210px] flex-col items-center justify-center rounded-2xl py-4 px-6 shadow-2xl transition-all ${
                  isBig
                    ? 'bg-gradient-to-b from-[#2a220e] via-[#1a1508] to-[#0d0b04] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                    : 'bg-gradient-to-b from-[#0e1c31] via-[#091222] to-[#050a14] border-2 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#a8a192] mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#f3d878]" />
                  <span>CONFIDENCE {prediction.confidence}%</span>
                </div>

                <span
                  className={`font-serif text-5xl font-black tracking-widest ${
                    isBig ? 'text-gold-gradient' : 'text-sky-300'
                  }`}
                >
                  {prediction.predictedOutcome}
                </span>

                <span className="mt-1 text-[11px] font-mono text-[#bfb7a6]">
                  {isBig ? 'Number Set: [ 5 · 6 · 7 · 8 · 9 ]' : 'Number Set: [ 0 · 1 · 2 · 3 · 4 ]'}
                </span>
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span className="text-[#8c8475]">AI Analysis Score:</span>
              <span className="font-mono font-bold text-[#f5d77f] bg-black/40 px-2 py-0.5 rounded border border-[#d4af37]/30">
                {prediction.aiScore} / 100
              </span>
            </div>
          </div>

          {/* Probability Distribution & Details */}
          <div className="md:col-span-7 flex flex-col justify-center gap-3.5 bg-[#090b10]/70 rounded-xl p-4 border border-white/[0.05]">
            {/* Probability Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-[#f5d77f]">BIG: {prediction.bigProbability}%</span>
                <span className="text-sky-400">SMALL: {prediction.smallProbability}%</span>
              </div>

              <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-[#151722] p-0.5 border border-white/10">
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-[#ba9527] to-[#f5d77f] transition-all duration-500"
                  style={{ width: `${prediction.bigProbability}%` }}
                />
                <div
                  className="absolute right-0 top-0.5 bottom-0.5 rounded-r-full bg-gradient-to-l from-sky-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${prediction.smallProbability}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-[#787163] font-mono">
                <span>0%</span>
                <span>50% (Equilibrium)</span>
                <span>100%</span>
              </div>
            </div>

            {/* AI Pattern and Model Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8c8475]">Active Optimal Model:</span>
                <span className="font-semibold text-[#f5d77f] text-[11px] truncate max-w-[200px]">
                  {prediction.selectedModel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8c8475]">Identified Pattern:</span>
                <span className="font-semibold text-[#ede8dc] text-[11px]">{prediction.patternDetected}</span>
              </div>
              <p className="text-[#a8a192] text-[11px] leading-relaxed pt-1 border-t border-white/[0.04]">
                {prediction.rationale}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-6 text-center py-6 text-xs text-[#8c8475]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent mx-auto mb-2" />
          <span>Synchronizing historical draws to evaluate statistical models for #{currentIssueNumber}...</span>
        </div>
      )}

      {/* Target Win Ratio Benchmark & Non-guaranteed Disclaimer */}
      <div className="border-t border-[#d4af37]/15 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#8c8475]">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>
            <strong className="text-[#ede8dc]">Experimental Target:</strong> 70.0% Win Rate (Model Confidence is separate from historical results).
          </span>
        </div>
        <div className="font-mono text-[#bfb7a6]">
          Last 100 Rolling Accuracy: <strong className="text-emerald-400">{currentModeState.metrics.rolling100WinRate}%</strong>
        </div>
      </div>
    </div>
  );
};
