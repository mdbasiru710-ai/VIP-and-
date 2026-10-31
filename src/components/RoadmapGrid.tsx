/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameResult } from '../types';

interface RoadmapGridProps {
  results: GameResult[];
  maxColumns?: number;
  title?: string;
}

export const RoadmapGrid: React.FC<RoadmapGridProps> = ({
  results,
  maxColumns = 18,
  title = 'Real-Time Bead Roadmap (Big Road)'
}) => {
  // Sort oldest to newest for chronological left-to-right display
  const chronological = [...results].slice(0, 100).reverse();

  // Create columns of size 5
  const rows = 5;
  const cols = maxColumns;

  // Render bead items
  const items = chronological.slice(-cols * rows);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm font-bold text-[#f5d77f]">{title}</span>
          <span className="text-xs text-[#8c8475] hidden sm:inline">· Last {items.length} rounds sequence</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#d4af37] flex items-center justify-center text-[8px] font-black text-black">B</span>
            <span className="text-[#bfb7a6]">BIG (5-9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sky-500 flex items-center justify-center text-[8px] font-black text-white">S</span>
            <span className="text-[#bfb7a6]">SMALL (0-4)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-5 grid-flow-col gap-1.5 p-1 bg-[#090b10] rounded-xl border border-white/[0.04] min-w-full">
          {items.map((res) => {
            const isBig = res.outcome === 'BIG';
            const isViolet = res.color.includes('VIOLET');
            return (
              <div
                key={res.id}
                title={`Period: ${res.period}\nNumber: ${res.number}\nOutcome: ${res.outcome}\nColor: ${res.color}`}
                className={`relative flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold transition-transform hover:scale-110 cursor-pointer shadow-sm ${
                  isBig
                    ? 'bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-[#120e05] border border-[#ffeb99]'
                    : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white border border-sky-300'
                }`}
              >
                <span>{res.number}</span>
                {isViolet && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-purple-500 border border-[#090b10]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
