/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { results, signals, exportData } = useGame();

  const [searchPeriod, setSearchPeriod] = useState('');
  const [cycleFilter, setCycleFilter] = useState<'ALL' | '30s' | '1m'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'PENDING'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'BIG' | 'SMALL'>('ALL');
  const [limit, setLimit] = useState<number>(30);

  // Pair results with their corresponding AI signals
  const records = results.map(res => {
    const sig = signals.find(s => s.period === res.period && s.gameType === res.gameType);
    return {
      result: res,
      signal: sig
    };
  });

  const filteredRecords = records.filter(item => {
    if (searchPeriod && !item.result.period.toLowerCase().includes(searchPeriod.toLowerCase())) {
      return false;
    }
    if (cycleFilter !== 'ALL' && item.result.gameType !== cycleFilter) {
      return false;
    }
    if (outcomeFilter !== 'ALL' && item.result.outcome !== outcomeFilter) {
      return false;
    }
    if (statusFilter !== 'ALL') {
      if (!item.signal || item.signal.status !== statusFilter) return false;
    }
    return true;
  });

  const handleExportCsv = async () => {
    const csv = await exportData('csv');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aura_vip_signals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              Historical Game Results & Signal Audits
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Complete database audit of drawn numbers, mathematical predictions, and automatic WIN / LOSS verification.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-lg border border-[#d4af37]/40 bg-[#17140e] px-4 py-2 text-xs font-bold text-[#f5d77f] hover:bg-[#252014] transition self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV Spreadsheet</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#787163]" />
          <input
            type="text"
            value={searchPeriod}
            onChange={(e) => setSearchPeriod(e.target.value)}
            placeholder="Search by Period ID (e.g. 202610...)"
            className="w-full rounded-xl bg-[#090b10] border border-white/10 pl-9 pr-4 py-2 text-[#ede8dc] placeholder-[#6e685c] focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value as 'ALL' | '30s' | '1m')}
            className="rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
          >
            <option value="ALL">All Cycles</option>
            <option value="30s">30-Second</option>
            <option value="1m">1-Minute</option>
          </select>

          {/* Outcome */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as 'ALL' | 'BIG' | 'SMALL')}
            className="rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="BIG">BIG Only</option>
            <option value="SMALL">SMALL Only</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'WIN' | 'LOSS' | 'PENDING')}
            className="rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="WIN">WIN Only</option>
            <option value="LOSS">LOSS Only</option>
            <option value="PENDING">PENDING Only</option>
          </select>

          {/* Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
          >
            <option value={20}>20 Rows</option>
            <option value={50}>50 Rows</option>
            <option value={100}>100 Rows</option>
          </select>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#090b10]/80 text-[11px] font-semibold uppercase tracking-wider text-[#7e7769]">
                <th className="py-3 px-4">Period ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Cycle</th>
                <th className="py-3 px-3">Drawn Number</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3">Color</th>
                <th className="py-3 px-3">AI Prediction</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Model Pattern</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredRecords.slice(0, limit).map(({ result, signal }) => {
                const isBig = result.outcome === 'BIG';
                const isWin = signal && signal.status === 'WIN';
                const isLoss = signal && signal.status === 'LOSS';
                const isPending = signal && signal.status === 'PENDING';
                const dateStr = new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                return (
                  <tr key={result.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#ede8dc]">
                      #{result.period}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#8c8475]">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[11px] font-bold ${
                        result.gameType === '30s' ? 'text-[#f5d77f]' : 'text-sky-300'
                      }`}>
                        {result.gameType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow ${
                        isBig
                          ? 'bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-[#120e05]'
                          : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white'
                      }`}>
                        {result.number}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#ede8dc]">
                      {result.outcome}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#bfb7a6]">
                      {result.color}
                    </td>
                    <td className="py-3 px-3">
                      {signal ? (
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          signal.predictedOutcome === 'BIG'
                            ? 'bg-[#2a220e] text-[#f5d77f] border border-[#d4af37]/30'
                            : 'bg-[#0f1d33] text-sky-300 border border-sky-400/30'
                        }`}>
                          {signal.predictedOutcome}
                        </span>
                      ) : (
                        <span className="text-[#666155]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#bfb7a6]">
                      {signal ? `${signal.confidence}%` : '-'}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#999080] max-w-[180px] truncate">
                      {signal?.patternDetected || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[11px]">
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
                      {isPending && (
                        <span className="text-[#d4af37] animate-pulse">
                          PENDING
                        </span>
                      )}
                      {!signal && <span className="text-[#666155]">-</span>}
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-[#787163]">
                    No historical draws match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
