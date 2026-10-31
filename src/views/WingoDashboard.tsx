/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWingo } from '../context/WingoContext';
import { ActiveWingoPredictionCard } from '../components/ActiveWingoPredictionCard';
import { SettledHistoryTable } from '../components/SettledHistoryTable';
import { WingoMetricsBar } from '../components/WingoMetricsBar';
import { DataConnectionError } from '../components/DataConnectionError';
import { ApiConfigModal } from '../components/ApiConfigModal';
import { RoadmapGrid } from '../components/RoadmapGrid';
import { BacktestPanel } from '../components/BacktestPanel';
import { GameResult } from '../types';
import { Clock, ShieldCheck, Zap, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

interface WingoDashboardProps {
  onOpenSettings: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
}

export const WingoDashboard: React.FC<WingoDashboardProps> = ({
  onOpenSettings,
  isSettingsOpen,
  onCloseSettings
}) => {
  const {
    activeMode,
    setActiveMode,
    currentModeState,
    forceSyncCurrentMode
  } = useWingo();

  const isError = currentModeState.syncState === 'DATA_CONNECTION_ERROR';
  const isSyncing = currentModeState.syncState === 'SYNCING';

  // Format settled history for RoadmapGrid
  const roadmapResults: GameResult[] = currentModeState.history.map(item => ({
    id: `draw_${item.issueNumber}`,
    period: item.issueNumber,
    gameType: activeMode,
    number: item.number,
    outcome: item.outcome,
    color: item.color,
    timestamp: item.settledAt,
    isLive: true
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* VIP Mode Switcher Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#17140e] via-[#0c0d12] to-[#07080b] p-4 md:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#f5d77f]">
                <ShieldCheck className="h-3 w-3" />
                OFFICIAL WINGO ENGINE
              </span>
              <span className="text-xs text-[#8c8475]">Exact Issue Synchronization</span>
            </div>
            <h1 className="font-serif text-xl md:text-2xl font-black text-gold-gradient mt-1">
              {activeMode === '30s' ? 'WinGo 30 Seconds' : 'WinGo 1 Minute'} VIP Dashboard
            </h1>
            <p className="text-xs text-[#a8a192] mt-0.5">
              Live API issue number synchronization with server-authoritative countdown and settled history audit.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 bg-[#090b10] p-1.5 rounded-xl border border-white/10 self-start sm:self-center">
            <button
              onClick={() => setActiveMode('30s')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeMode === '30s'
                  ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'text-[#8c8475] hover:text-[#ede8dc]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>30 Seconds</span>
            </button>

            <button
              onClick={() => setActiveMode('1m')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeMode === '1m'
                  ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'text-[#8c8475] hover:text-[#ede8dc]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>1 Minute</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: If API data fails, show DATA CONNECTION ERROR */}
      {isError ? (
        <DataConnectionError
          errorMessage={currentModeState.errorMessage}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <>
          {/* Active Prediction Card with Exact API Issue Number */}
          <ActiveWingoPredictionCard
            currentIssueNumber={currentModeState.currentIssueNumber}
            serverRemainingSeconds={currentModeState.serverRemainingSeconds}
            totalCycleSeconds={currentModeState.cycleSeconds}
            isLocked={currentModeState.isLocked}
            prediction={currentModeState.activePrediction}
            mode={activeMode}
          />

          {/* Mode-specific Metrics Bar */}
          <WingoMetricsBar
            metrics={currentModeState.metrics}
            mode={activeMode}
          />

          {/* Chronological Walk-Forward Backtesting Panel */}
          <BacktestPanel />

          {/* Visual Bead Roadmap for current mode */}
          <RoadmapGrid
            results={roadmapResults}
            title={`WinGo ${activeMode === '30s' ? '30s' : '1m'} Official Bead Roadmap`}
          />

          {/* Settled Draw History Table */}
          <SettledHistoryTable
            history={currentModeState.history}
            predictions={currentModeState.predictions}
            mode={activeMode}
          />
        </>
      )}

      {/* Settings Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
      />
    </div>
  );
};
