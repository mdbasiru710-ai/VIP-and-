/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SettledDraw, WingoPrediction } from '../types';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';

interface SettledHistoryTableProps {
  history: SettledDraw[];
  predictions: WingoPrediction[];
  mode: '30s' | '1m';
}

export const SettledHistoryTable: React.FC<SettledHistoryTableProps> = ({
  history,
  predictions,
  mode
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    return item.issueNumber.includes(searchTerm);
  });

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/[0.06] pb-3">
        <div>
          <h2 className="font-serif text-base font-bold text-[#ede8dc]">
            WinGo {mode === '30s' ? '30s' : '1m'} Settled Result History
          </h2>
          <p className="text-xs text-[#8c8475]">
            Directly fetched from authoritative platform API history
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#787163]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Issue #..."
            className="w-full sm:w-44 rounded-lg bg-[#090b10] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-[#ede8dc] placeholder-[#6e685c] focus:border-[#d4af37] focus:outline-none font-mono"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#7e7769]">
              <th className="py-2.5 px-3">Exact API Issue #</th>
              <th className="py-2.5 px-3">Drawn #</th>
              <th className="py-2.5 px-3">Settled Outcome</th>
              <th className="py-2.5 px-3">Color</th>
              <th className="py-2.5 px-3">AI Prediction</th>
              <th className="py-2.5 px-3">Audit Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredHistory.map((item) => {
              const matchedPred = predictions.find(p => p.targetIssueNumber === item.issueNumber);
              const isBig = item.outcome === 'BIG';
              const isWin = matchedPred && matchedPred.status === 'WIN';
              const isLoss = matchedPred && matchedPred.status === 'LOSS';

              return (
                <tr key={item.issueNumber} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-3 font-mono font-bold text-[#ede8dc]">
                    #{item.issueNumber}
                  </td>
                  <td className="py-3 px-3 font-mono font-black">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow-md ${
                        isBig
                          ? 'bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-[#120e05]'
                          : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white'
                      }`}
                    >
                      {item.number}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#ede8dc]">
                    {item.outcome}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#bfb7a6]">
                    {item.color}
                  </td>
                  <td className="py-3 px-3">
                    {matchedPred ? (
                      matchedPred.predictedOutcome === 'NO_SIGNAL' ? (
                        <span className="font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          NO SIGNAL
                        </span>
                      ) : (
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          matchedPred.predictedOutcome === 'BIG'
                            ? 'bg-[#2a220e] text-[#f5d77f] border border-[#d4af37]/30'
                            : 'bg-[#0f1d33] text-sky-300 border border-sky-400/30'
                        }`}>
                          {matchedPred.predictedOutcome} ({matchedPred.confidence}%)
                        </span>
                      )
                    ) : (
                      <span className="text-[#666155]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[11px]">
                    {isWin && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        WIN
                      </span>
                    )}
                    {isLoss && (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        LOSS
                      </span>
                    )}
                    {matchedPred?.status === 'VOID' && (
                      <span className="text-amber-400 font-mono text-[10px]">
                        VOID (PASS)
                      </span>
                    )}
                    {!matchedPred && (
                      <span className="text-[#666155]">Settled Prior</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-[#787163]">
                  No settled records found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
