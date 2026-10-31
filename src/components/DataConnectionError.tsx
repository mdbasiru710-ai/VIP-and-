/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Settings, ShieldAlert, WifiOff } from 'lucide-react';
import { useWingo } from '../context/WingoContext';

interface DataConnectionErrorProps {
  errorMessage: string;
  onOpenSettings: () => void;
}

export const DataConnectionError: React.FC<DataConnectionErrorProps> = ({
  errorMessage,
  onOpenSettings
}) => {
  const { forceSyncCurrentMode, activeMode } = useWingo();
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await forceSyncCurrentMode();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-rose-500/50 bg-gradient-to-b from-[#240a0e] via-[#150608] to-[#090304] p-6 text-center shadow-[0_0_40px_rgba(244,63,94,0.18)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mb-4">
        <WifiOff className="h-7 w-7 animate-pulse" />
      </div>

      <div className="inline-block rounded-full bg-rose-950 border border-rose-500/40 px-3 py-1 font-mono text-xs font-black tracking-widest text-rose-300 uppercase mb-2">
        DATA CONNECTION ERROR
      </div>

      <h2 className="font-serif text-xl md:text-2xl font-bold text-white mb-2">
        WinGo {activeMode === '30s' ? '30-Second' : '1-Minute'} Synchronization Interrupted
      </h2>

      <p className="max-w-md mx-auto text-xs md:text-sm text-rose-200/80 leading-relaxed mb-4">
        {errorMessage || 'Unable to retrieve authorized live issue number from Wingo data source.'}
      </p>

      {/* Strict Integrity Notice */}
      <div className="mx-auto max-w-lg rounded-xl bg-black/60 border border-rose-500/25 p-3.5 text-xs text-rose-200/90 text-left flex items-start gap-3 mb-5">
        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-rose-300">Strict Issue Integrity Policy Enforced</div>
          <div className="text-[11px] leading-relaxed text-[#c7b5b5]">
            Predictions are immediately blocked and suspended whenever the API connection drops. The system will never fabricate simulated issue numbers or fake signals. All algorithms resume automatically once the verified issue number stream is restored.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-900/40 hover:from-rose-500 hover:to-rose-600 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Re-synchronizing API...' : 'Retry Connection Now'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
        >
          <Settings className="h-4 w-4 text-[#d4af37]" />
          <span>Configure API Source</span>
        </button>
      </div>
    </div>
  );
};
