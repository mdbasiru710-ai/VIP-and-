/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWingo } from '../context/WingoContext';
import { ShieldCheck, Cpu, CheckCircle2, Award, Info, AlertTriangle, Layers } from 'lucide-react';

export const BacktestPanel: React.FC = () => {
  const { currentBacktestSummary, activeMode, windowSize, setWindowSize } = useWingo();

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#f5d77f]" />
            <h2 className="font-serif text-base font-bold text-[#ede8dc]">
              Chronological Walk-Forward Backtest & Model Validation
            </h2>
          </div>
          <p className="text-xs text-[#8c8475] mt-0.5">
            Strict chronological out-of-sample simulation preventing future-data leakage. Evaluates all statistical models.
          </p>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-1.5 bg-[#090b10] p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-[#8c8475] px-2 text-[11px]">Backtest Depth:</span>
          {([100, 200, 500] as const).map(size => (
            <button
              key={size}
              onClick={() => setWindowSize(size)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                windowSize === size
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'text-[#8c8475] hover:text-[#ede8dc]'
              }`}
            >
              {size} Rounds
            </button>
          ))}
        </div>
      </div>

      {/* Optimal Model Badge Card */}
      <div className="mb-4 rounded-xl bg-gradient-to-r from-[#1e1910] via-[#12131a] to-[#090b10] p-3.5 border border-[#d4af37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[#8c8475] text-[10px] uppercase font-bold tracking-wider">
              Empirically Selected Model for WinGo {activeMode}
            </span>
            <div className="font-serif text-sm font-bold text-[#f5d77f]">
              {currentBacktestSummary.optimalModelName}
            </div>
            <p className="text-[11px] text-[#a8a192]">
              Outperformed peer models with {currentBacktestSummary.optimalModelWinRate}% walk-forward accuracy across verified sample.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
          <div className="text-right">
            <div className="text-[10px] text-[#8c8475]">Walk-Forward Rate</div>
            <div className="text-base font-black text-emerald-400">
              {currentBacktestSummary.optimalModelWinRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#7e7769]">
              <th className="py-2.5 px-3">Model Architecture</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Tested Draws</th>
              <th className="py-2.5 px-3">Signals Generated</th>
              <th className="py-2.5 px-3">W / L Record</th>
              <th className="py-2.5 px-3">Walk-Forward Accuracy</th>
              <th className="py-2.5 px-3">Selection Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {currentBacktestSummary.models.map(m => (
              <tr key={m.modelId} className={`hover:bg-white/[0.02] transition ${m.isOptimal ? 'bg-[#d4af37]/[0.03]' : ''}`}>
                <td className="py-3 px-3 font-semibold text-[#ede8dc]">
                  <div className="flex items-center gap-1.5">
                    {m.isOptimal && <CheckCircle2 className="h-3.5 w-3.5 text-[#f5d77f]" />}
                    <span>{m.modelName}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#8c8475] text-[11px] max-w-[220px]">
                  {m.description}
                </td>
                <td className="py-3 px-3 font-mono text-[#bfb7a6]">
                  {m.sampleTested}
                </td>
                <td className="py-3 px-3 font-mono text-[#bfb7a6]">
                  {m.signalsCount}
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="text-emerald-400 font-bold">{m.wins}W</span>
                  <span className="text-[#666155] mx-1">/</span>
                  <span className="text-rose-400 font-bold">{m.losses}L</span>
                </td>
                <td className="py-3 px-3 font-mono text-sm font-black text-emerald-400">
                  {m.walkForwardWinRate}%
                </td>
                <td className="py-3 px-3">
                  {m.isOptimal ? (
                    <span className="rounded bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#f5d77f]">
                      OPTIMAL ACTIVE
                    </span>
                  ) : (
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#8c8475]">
                      BENCHMARK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-[#8c8475] border-t border-white/[0.04] pt-2.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-[#d4af37] mt-0.5" />
        <span>
          Walk-forward testing evaluates predictions sequentially: at step $t$, models are trained strictly on draws prior to $t$ without look-ahead bias, then verified against round $t$.
        </span>
      </div>
    </div>
  );
};
