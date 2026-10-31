/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Volume2, VolumeX, Radio, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    apiConfig,
    userSettings,
    updateSettings,
    metrics,
    activeTab,
    setActiveTab,
    connectionState,
    lastPingMs
  } = useGame();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !userSettings.soundEnabled });
  };

  const navItems = [
    { id: 'home', label: 'VIP Home' },
    { id: 'signals', label: 'Live Signals' },
    { id: '30s', label: '30s Fast' },
    { id: '1m', label: '1m Classic' },
    { id: 'ai', label: 'AI Analytics' },
    { id: 'history', label: 'History' },
    { id: 'performance', label: 'Performance' },
    { id: 'settings', label: 'Settings & API' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d4af37]/20 bg-[#07080b]/90 backdrop-blur-xl">
      {/* Top micro bar for market connection info */}
      <div className="border-b border-white/[0.04] px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            {apiConfig.mode === 'LIVE' ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[11px] font-semibold tracking-wider">AUTHORIZED LIVE API</span>
                {lastPingMs > 0 && <span className="text-[#a09a8c] text-[10px]">({lastPingMs}ms)</span>}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#d4af37]">
                <Radio className="h-3 w-3 animate-pulse" />
                <span className="font-mono text-[11px] font-medium tracking-wide">DEMO REALISTIC SIMULATION</span>
                <span className="hidden text-[10px] text-[#8c8475] sm:inline">· Authorize API in Settings</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-[#bfb7a6]">
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-[#8c8475]">Win Rate</span>
              <span className="font-mono font-bold text-emerald-400">{metrics.winRate}%</span>
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              <span className="text-[#8c8475]">Units P&L</span>
              <span className={`font-mono font-bold ${metrics.simulatedProfitUnits >= 0 ? 'text-[#e6ca65]' : 'text-rose-400'}`}>
                {metrics.simulatedProfitUnits >= 0 ? `+${metrics.simulatedProfitUnits}` : metrics.simulatedProfitUnits} U
              </span>
            </div>
            <button
              onClick={toggleSound}
              className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[11px] text-[#d4af37] transition hover:bg-white/5"
              title="Toggle Audio Feedback"
            >
              {userSettings.soundEnabled ? (
                <>
                  <Volume2 className="h-3 w-3 text-[#d4af37]" />
                  <span>Audio ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3 text-[#706b60]" />
                  <span className="text-[#706b60]">Muted</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex cursor-pointer items-center gap-3 select-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5d77f] via-[#d4af37] to-[#805e13] p-[1px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0c0d12]">
              <Crown className="h-5 w-5 text-[#f3d878]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-extrabold tracking-wider text-gold-gradient">
                AURA VIP
              </span>
              <span className="rounded bg-[#d4af37]/15 border border-[#d4af37]/30 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-[#f5d77f]">
                {userSettings.vipTier}
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-[#9e9687]">AI BIG SMALL PREDICTOR</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'text-[#f5d77f]'
                    : 'text-[#9e9687] hover:text-[#ede8dc]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_8px_#d4af37]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#16140e] px-3 py-1.5 text-xs font-semibold text-[#f5d77f] transition hover:border-[#d4af37] hover:bg-[#252014]"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">API Config</span>
            <span className="sm:hidden">API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
