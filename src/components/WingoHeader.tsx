/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWingo } from '../context/WingoContext';
import { Crown, Volume2, VolumeX, RefreshCw, AlertCircle, ShieldCheck, Settings } from 'lucide-react';

interface WingoHeaderProps {
  currentView: 'dashboard' | 'analytics';
  onSelectView: (view: 'dashboard' | 'analytics') => void;
  onOpenSettings: () => void;
}

export const WingoHeader: React.FC<WingoHeaderProps> = ({
  currentView,
  onSelectView,
  onOpenSettings
}) => {
  const {
    activeMode,
    setActiveMode,
    currentModeState,
    soundEnabled,
    toggleSound,
    forceSyncCurrentMode
  } = useWingo();

  const isError = currentModeState.syncState === 'DATA_CONNECTION_ERROR';
  const isSyncing = currentModeState.syncState === 'SYNCING';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d4af37]/25 bg-[#07080b]/95 backdrop-blur-xl">
      {/* Top authoritative ticker */}
      <div className="border-b border-white/[0.04] px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            {isError ? (
              <span className="flex items-center gap-1.5 font-mono font-bold text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                <span>DATA CONNECTION ERROR</span>
              </span>
            ) : isSyncing ? (
              <span className="flex items-center gap-1.5 font-mono text-[#d4af37]">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>SYNCING AUTHORITATIVE ISSUE...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-[11px]">API SYNCHRONIZED</span>
                <span className="text-[#8c8475] hidden sm:inline">· Exact Server Issue</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => forceSyncCurrentMode()}
              className="flex items-center gap-1 text-[11px] text-[#bfb7a6] hover:text-[#f5d77f] transition"
              title="Force Refresh API Data"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Refresh API</span>
            </button>

            <button
              onClick={toggleSound}
              className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[11px] text-[#d4af37] transition hover:bg-white/5"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-3 w-3 text-[#d4af37]" />
                  <span>ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3 text-[#6e685c]" />
                  <span className="text-[#6e685c]">Mute</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2 sm:px-4">
        {/* Brand */}
        <div 
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#805e13] p-[1px] shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0c0d12]">
              <Crown className="h-4 w-4 text-[#f5d77f]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base font-extrabold tracking-wider text-gold-gradient">
                AURA VIP
              </span>
              <span className="rounded bg-[#d4af37]/20 border border-[#d4af37]/40 px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#f5d77f]">
                WINGO
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-[#8c8475]">EXACT ISSUE SYNCHRONIZER</p>
          </div>
        </div>

        {/* Navigation Tabs (Dashboard vs Analytics) */}
        <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentView === 'dashboard'
                ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            Predictor
          </button>
          <button
            onClick={() => onSelectView('analytics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentView === 'analytics'
                ? 'bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Central Mode Switcher (strictly separates 30s and 1m modes) */}
        <div className="hidden md:flex items-center bg-[#0a0c12] p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveMode('30s')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeMode === '30s'
                ? 'bg-[#d4af37] text-black'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            <span>30s</span>
          </button>

          <button
            onClick={() => setActiveMode('1m')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeMode === '1m'
                ? 'bg-[#d4af37] text-black'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            <span>1m</span>
          </button>
        </div>

        {/* Settings Action */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 rounded-lg border border-[#d4af37]/35 bg-[#17140e] px-2.5 py-1.5 text-xs font-bold text-[#f5d77f] hover:bg-[#252014] transition"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">API Config</span>
        </button>
      </div>
    </header>
  );
};
