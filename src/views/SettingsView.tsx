/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Trash2, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Zap,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { sound } from '../services/audio';

export const SettingsView: React.FC = () => {
  const {
    apiConfig,
    userSettings,
    updateConfig,
    updateSettings,
    testConnection,
    resetDatabase,
    exportData,
    importData,
    results,
    signals,
    connectionState,
    lastPingMs,
    apiError
  } = useGame();

  // Local form state for API configuration
  const [mode, setMode] = useState<'DEMO' | 'LIVE'>(apiConfig.mode);
  const [endpointUrl, setEndpointUrl] = useState(apiConfig.endpointUrl);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [authType, setAuthType] = useState<string>(apiConfig.authType);
  const [customHeader, setCustomHeader] = useState(apiConfig.customHeaderName);
  const [pollInterval, setPollInterval] = useState(apiConfig.pollIntervalSec);
  const [showKey, setShowKey] = useState(false);

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string; sampleData?: unknown } | null>(null);

  // Import / Export state
  const [importJsonText, setImportJsonText] = useState('');
  const [importNotice, setImportNotice] = useState<{ success: boolean; msg: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveApi = async () => {
    await updateConfig({
      mode,
      endpointUrl,
      apiKey,
      authType: authType as 'Bearer' | 'ApiKey' | 'CustomHeader',
      customHeaderName: customHeader,
      pollIntervalSec: pollInterval,
      isConnected: mode === 'LIVE' ? (testResult?.success || false) : false
    });
    alert('API settings saved successfully.');
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(endpointUrl, apiKey, authType, customHeader);
      setTestResult(res);
      if (res.success && mode === 'LIVE') {
        await updateConfig({ isConnected: true });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportJson = async () => {
    const json = await exportData('json');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aura_vip_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleImport = async () => {
    if (!importJsonText.trim()) return;
    const ok = await importData(importJsonText);
    if (ok) {
      setImportNotice({ success: true, msg: 'Database imported and synchronized successfully.' });
      setImportJsonText('');
    } else {
      setImportNotice({ success: false, msg: 'Invalid JSON format or corrupted schema.' });
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the database? This will restore clean, verified seed data.')) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
      alert('Database reset to verified baseline seed records.');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              Settings & Authorized API Gateway
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Configure live game results provider, audio alerts, and persistent database storage.
          </p>
        </div>
      </div>

      {/* 1. LIVE DATA API INTEGRATION LAYER */}
      <div className="glass-panel-gold rounded-2xl p-5 md:p-6 border border-[#d4af37]/35">
        <div className="flex items-center justify-between mb-4 border-b border-[#d4af37]/20 pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-[#f5d77f]" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#ede8dc]">
                Authorized Live Game API Integration
              </h2>
              <p className="text-xs text-[#8c8475]">
                Direct connection layer for authentic real-time game draws
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'LIVE' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE MODE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-[#272113] border border-[#d4af37]/40 px-3 py-1 text-xs font-mono font-bold text-[#f5d77f]">
                <Radio className="h-3 w-3 animate-pulse" />
                DEMO SIMULATION
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Mode Switcher */}
          <div>
            <label className="block font-semibold text-[#ede8dc] mb-1.5">
              Data Feed Mode:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setMode('DEMO')}
                className={`p-3 rounded-xl border text-left transition ${
                  mode === 'DEMO'
                    ? 'border-[#d4af37] bg-[#241e12] text-[#f5d77f]'
                    : 'border-white/10 bg-[#090b10] text-[#8c8475] hover:text-[#ede8dc]'
                }`}
              >
                <div className="font-bold">🟡 Realistic Demo Simulation</div>
                <div className="text-[11px] text-[#787163] mt-0.5">
                  Internal clock-synchronized mathematical generator
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('LIVE')}
                className={`p-3 rounded-xl border text-left transition ${
                  mode === 'LIVE'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-white/10 bg-[#090b10] text-[#8c8475] hover:text-[#ede8dc]'
                }`}
              >
                <div className="font-bold">🟢 Authorized Live API</div>
                <div className="text-[11px] text-[#787163] mt-0.5">
                  Fetch actual authenticated game results from server
                </div>
              </button>
            </div>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="block font-semibold text-[#ede8dc] mb-1">
              Game Results API Endpoint URL:
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="e.g. https://api.yourgameprovider.com/v1/wingo/results"
              className="w-full rounded-xl bg-[#090b10] border border-white/10 px-3.5 py-2.5 text-[#ede8dc] placeholder-[#555045] font-mono focus:border-[#d4af37] focus:outline-none"
            />
            <p className="text-[11px] text-[#787163] mt-1">
              Accepts GET endpoints returning standardized JSON <code>{`{ period: string, number: number }`}</code>.
            </p>
          </div>

          {/* Authorization Type & Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#ede8dc] mb-1">
                Auth Method:
              </label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full rounded-xl bg-[#090b10] border border-white/10 px-3 py-2.5 text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Bearer">Bearer Token (Authorization: Bearer ...)</option>
                <option value="ApiKey">API Key (x-api-key: ...)</option>
                <option value="CustomHeader">Custom Header</option>
              </select>
            </div>

            {authType === 'CustomHeader' && (
              <div>
                <label className="block font-semibold text-[#ede8dc] mb-1">
                  Custom Header Name:
                </label>
                <input
                  type="text"
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  placeholder="e.g. X-Auth-Token"
                  className="w-full rounded-xl bg-[#090b10] border border-white/10 px-3.5 py-2.5 text-[#ede8dc] font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            )}

            <div className={authType === 'CustomHeader' ? 'md:col-span-1' : 'md:col-span-2'}>
              <label className="block font-semibold text-[#ede8dc] mb-1">
                API Secret Key / Token:
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter authorized API key or token"
                  className="w-full rounded-xl bg-[#090b10] border border-white/10 pl-3.5 pr-10 py-2.5 text-[#ede8dc] font-mono focus:border-[#d4af37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-[#787163] hover:text-[#ede8dc]"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Test connection & Save buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting || !endpointUrl}
              className="flex items-center gap-2 rounded-xl border border-[#d4af37] bg-[#221c10] px-4 py-2 font-bold text-[#f5d77f] hover:bg-[#332a18] transition disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Pinging Endpoint...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Test Connection & Latency</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveApi}
              className="btn-gold rounded-xl px-5 py-2 text-xs font-bold"
            >
              Save Configuration
            </button>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div className={`rounded-xl p-3 border text-xs ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{testResult.success ? 'Connection Verified' : 'Connection Check Failed'}</span>
                {testResult.latencyMs > 0 && <span className="font-mono text-[11px]">({testResult.latencyMs}ms)</span>}
              </div>
              <p className="mt-1">{testResult.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. DATABASE & PERSISTENT STORAGE MANAGEMENT */}
      <div className="glass-panel rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#d4af37]" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#ede8dc]">
                Database & Historical Storage
              </h2>
              <p className="text-xs text-[#8c8475]">
                IndexedDB browser storage with complete backup export and synchronization
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-[#d4af37]">
            {results.length} draws · {signals.length} signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl bg-[#090b10] p-3.5 border border-white/[0.06]">
            <div className="text-xs text-[#8c8475]">Stored Results</div>
            <div className="font-mono text-xl font-bold text-[#ede8dc] mt-1">{results.length} rounds</div>
          </div>
          <div className="rounded-xl bg-[#090b10] p-3.5 border border-white/[0.06]">
            <div className="text-xs text-[#8c8475]">Stored Signals</div>
            <div className="font-mono text-xl font-bold text-[#ede8dc] mt-1">{signals.length} signals</div>
          </div>
          <div className="rounded-xl bg-[#090b10] p-3.5 border border-white/[0.06]">
            <div className="text-xs text-[#8c8475]">Storage Engine</div>
            <div className="font-mono text-sm font-bold text-emerald-400 mt-1">IndexedDB + Local Cache</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#090b10] px-3.5 py-2 text-xs font-semibold text-[#ede8dc] hover:border-[#d4af37] transition"
          >
            <Download className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Export Database (JSON)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#090b10] px-3.5 py-2 text-xs font-semibold text-[#ede8dc] hover:border-[#d4af37] transition"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Export Signals (CSV)</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Reset Database to Seed</span>
          </button>
        </div>

        {/* Import JSON Area */}
        <div className="rounded-xl bg-[#090b10] p-4 border border-white/[0.06]">
          <label className="block text-xs font-semibold text-[#ede8dc] mb-1">
            Import Backup JSON:
          </label>
          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            rows={2}
            placeholder="Paste exported JSON payload here to restore..."
            className="w-full rounded-lg bg-[#06070a] border border-white/10 p-2 text-xs font-mono text-[#ede8dc] focus:border-[#d4af37] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleImport}
              disabled={!importJsonText.trim()}
              className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#1e1910] px-3 py-1.5 text-xs font-bold text-[#f5d77f] hover:bg-[#2b2210] transition disabled:opacity-40"
            >
              <Upload className="h-3 w-3" />
              <span>Import Data</span>
            </button>
            {importNotice && (
              <span className={`text-xs ${importNotice.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {importNotice.msg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. VIP AUDIO & NOTIFICATION PREFERENCES */}
      <div className="glass-panel rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-3">
          <Sliders className="h-5 w-5 text-[#f5d77f]" />
          <div>
            <h2 className="font-serif text-base font-bold text-[#ede8dc]">
              VIP Preferences & Audio Synthesizer
            </h2>
            <p className="text-xs text-[#8c8475]">
              Real harmonic audio chimes and Android haptic feedback controls
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Sound master toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
            <div>
              <div className="font-bold text-[#ede8dc]">Sound Effects & Harmonics</div>
              <div className="text-[#8c8475] text-[11px]">Chimes for new signals, countdown ticks and WIN alerts</div>
            </div>
            <button
              onClick={() => {
                const nextVal = !userSettings.soundEnabled;
                updateSettings({ soundEnabled: nextVal });
                if (nextVal) sound.playSignalChime();
              }}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                userSettings.soundEnabled
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {userSettings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
            <div className="flex justify-between font-bold text-[#ede8dc]">
              <span>Chime Audio Volume:</span>
              <span className="font-mono text-[#f5d77f]">{Math.round(userSettings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userSettings.soundVolume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                updateSettings({ soundVolume: vol });
              }}
              className="accent-[#d4af37]"
            />
          </div>

          {/* Min Confidence Alert */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
            <div>
              <div className="font-bold text-[#ede8dc]">Audio Alert Threshold</div>
              <div className="text-[#8c8475] text-[11px]">Only trigger chime if AI confidence meets or exceeds this percentage</div>
            </div>
            <select
              value={userSettings.minConfidenceAlert}
              onChange={(e) => updateSettings({ minConfidenceAlert: Number(e.target.value) })}
              className="rounded-lg bg-[#06070a] border border-white/10 px-3 py-1.5 text-[#f5d77f] font-mono font-bold focus:outline-none"
            >
              <option value={50}>50% (All signals)</option>
              <option value={60}>60% (Moderate)</option>
              <option value={65}>65% (High Conviction)</option>
              <option value={70}>70% (VIP Diamond)</option>
            </select>
          </div>

          {/* VIP Tier Badge Selection */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#090b10] border border-white/[0.06]">
            <div>
              <div className="font-bold text-[#ede8dc]">VIP Status Crest</div>
              <div className="text-[#8c8475] text-[11px]">Personalized account tier display</div>
            </div>
            <select
              value={userSettings.vipTier}
              onChange={(e) => updateSettings({ vipTier: e.target.value as 'GOLD' | 'PLATINUM' | 'DIAMOND' })}
              className="rounded-lg bg-[#06070a] border border-white/10 px-3 py-1.5 text-[#f5d77f] font-bold focus:outline-none"
            >
              <option value="GOLD">VIP GOLD</option>
              <option value="PLATINUM">VIP PLATINUM</option>
              <option value="DIAMOND">VIP DIAMOND</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
