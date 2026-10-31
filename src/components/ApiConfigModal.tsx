/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWingo } from '../context/WingoContext';
import { X, Key, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Trash2, Server } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    apiConfig,
    updateApiConfig,
    testUpstreamEndpoint,
    forceSyncCurrentMode,
    activeMode,
    clearModeHistory
  } = useWingo();

  const [externalUrl, setExternalUrl] = useState(apiConfig.externalUrl);
  const [authToken, setAuthToken] = useState(apiConfig.authToken);
  const [useCustomUpstream, setUseCustomUpstream] = useState(apiConfig.useCustomUpstream);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string; sample?: unknown } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    updateApiConfig({
      externalUrl,
      authToken,
      useCustomUpstream
    });
    await forceSyncCurrentMode();
    onClose();
  };

  const handleTestPing = async () => {
    if (!externalUrl) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testUpstreamEndpoint(externalUrl, authToken);
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel-gold w-full max-w-lg rounded-2xl p-5 md:p-6 border border-[#d4af37]/40 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#f5d77f]" />
            <h2 className="font-serif text-base font-bold text-gold-gradient">
              Wingo Platform API Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#8c8475] hover:text-[#ede8dc] hover:bg-white/5 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Source Mode Toggle */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-[#ede8dc] block">Data Source Mode:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUseCustomUpstream(false)}
              className={`p-3 rounded-xl border text-left transition ${
                !useCustomUpstream
                  ? 'border-[#d4af37] bg-[#221c10] text-[#f5d77f]'
                  : 'border-white/10 bg-[#090b10] text-[#8c8475]'
              }`}
            >
              <div className="font-bold">Authoritative Gateway</div>
              <div className="text-[10px] text-[#787163] mt-0.5">
                Integrated server sync engine
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUseCustomUpstream(true)}
              className={`p-3 rounded-xl border text-left transition ${
                useCustomUpstream
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                  : 'border-white/10 bg-[#090b10] text-[#8c8475]'
              }`}
            >
              <div className="font-bold">Custom Upstream API</div>
              <div className="text-[10px] text-[#787163] mt-0.5">
                Connect your Wingo server URL
              </div>
            </button>
          </div>
        </div>

        {/* Custom Upstream URL */}
        {useCustomUpstream && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#ede8dc] block mb-1">
                Wingo Platform API Endpoint:
              </label>
              <input
                type="text"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="e.g. https://your-wingo-api.com/api/webapi/GetNoaverageEmerdList"
                className="w-full rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] font-mono placeholder-[#555045] focus:border-[#d4af37] focus:outline-none"
              />
              <p className="text-[10px] text-[#787163] mt-1">
                Must return standard JSON containing <code>issueNumber</code> and <code>list</code>.
              </p>
            </div>

            <div>
              <label className="font-semibold text-[#ede8dc] block mb-1">
                Authorization Header / Token (Optional):
              </label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Bearer token or API key"
                className="w-full rounded-xl bg-[#090b10] border border-white/10 px-3 py-2 text-[#ede8dc] font-mono focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTesting || !externalUrl}
                className="flex items-center gap-2 rounded-xl border border-[#d4af37] bg-[#221c10] px-3.5 py-2 text-xs font-bold text-[#f5d77f] hover:bg-[#332a18] transition disabled:opacity-40"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Test Upstream Connection</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{testResult.success ? 'Upstream Verified' : 'Connection Failed'}</span>
                  {testResult.latencyMs > 0 && <span className="font-mono">({testResult.latencyMs}ms)</span>}
                </div>
                <p className="mt-1">{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Clear History Tool */}
        <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#ede8dc]">Clear {activeMode} Prediction History</div>
            <div className="text-[10px] text-[#787163]">Resets stored accuracy metrics for this mode</div>
          </div>
          <button
            onClick={() => {
              if (confirm(`Reset prediction history for WinGo ${activeMode}?`)) {
                clearModeHistory(activeMode);
              }
            }}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20"
          >
            <Trash2 className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-[#8c8475] hover:text-[#ede8dc] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-gold px-5 py-2 rounded-xl text-xs font-bold"
          >
            Save & Sync
          </button>
        </div>
      </div>
    </div>
  );
};
