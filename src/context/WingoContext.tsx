/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  GameMode, 
  SettledDraw, 
  WingoPrediction, 
  ModePerformanceMetrics, 
  ApiSyncState, 
  WingoApiConfig 
} from '../types';
import { wingoApi } from '../services/wingoApi';
import { wingoStorage } from '../services/wingoStorage';
import { wingoPredictor, BacktestSummary } from '../services/wingoPredictor';
import { sound } from '../services/audio';

interface ModeState {
  currentIssueNumber: string;
  serverRemainingSeconds: number;
  cycleSeconds: number;
  isLocked: boolean;
  history: SettledDraw[];
  predictions: WingoPrediction[];
  activePrediction: WingoPrediction | null;
  metrics: ModePerformanceMetrics;
  syncState: ApiSyncState;
  errorMessage: string;
  lastSyncedAt: number;
}

interface WingoContextType {
  activeMode: GameMode;
  setActiveMode: (mode: GameMode) => void;
  state30s: ModeState;
  state1m: ModeState;
  currentModeState: ModeState;
  apiConfig: WingoApiConfig;
  updateApiConfig: (cfg: Partial<WingoApiConfig>) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  forceSyncCurrentMode: () => Promise<void>;
  testUpstreamEndpoint: (url: string, token: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  clearModeHistory: (mode: GameMode) => void;
  windowSize: 100 | 200 | 500;
  setWindowSize: (size: 100 | 200 | 500) => void;
  currentMultiWindowAnalysis: any;
  currentBacktestSummary: BacktestSummary;
}

const WingoContext = createContext<WingoContextType | undefined>(undefined);

export const WingoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<GameMode>('30s');
  const [windowSize, setWindowSize] = useState<100 | 200 | 500>(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [apiConfig, setApiConfig] = useState<WingoApiConfig>(wingoStorage.getConfig());

  // 30s State
  const [state30s, setState30s] = useState<ModeState>({
    currentIssueNumber: '',
    serverRemainingSeconds: 0,
    cycleSeconds: 30,
    isLocked: false,
    history: [],
    predictions: wingoStorage.getPredictions('30s'),
    activePrediction: null,
    metrics: wingoStorage.calculateMetrics(wingoStorage.getPredictions('30s')),
    syncState: 'SYNCING',
    errorMessage: '',
    lastSyncedAt: 0
  });

  // 1m State
  const [state1m, setState1m] = useState<ModeState>({
    currentIssueNumber: '',
    serverRemainingSeconds: 0,
    cycleSeconds: 60,
    isLocked: false,
    history: [],
    predictions: wingoStorage.getPredictions('1m'),
    activePrediction: null,
    metrics: wingoStorage.calculateMetrics(wingoStorage.getPredictions('1m')),
    syncState: 'SYNCING',
    errorMessage: '',
    lastSyncedAt: 0
  });

  const isSyncingRef = useRef<{ '30s': boolean; '1m': boolean }>({ '30s': false, '1m': false });

  // Sync specific game mode from API
  const syncModeFromApi = useCallback(async (mode: GameMode) => {
    if (isSyncingRef.current[mode]) return;
    isSyncingRef.current[mode] = true;

    try {
      const data = await wingoApi.fetchLiveSync(mode, apiConfig);

      // Reconcile pending predictions with API's newly settled history
      const reconciledPredictions = wingoStorage.reconcilePredictionsWithHistory(mode, data.history);

      // Check if any pending prediction was just verified as WIN
      const lastSettled = data.latestSettledRound;
      if (lastSettled) {
        const justResolved = reconciledPredictions.find(
          p => p.targetIssueNumber === lastSettled.issueNumber && p.verifiedAt && (Date.now() - p.verifiedAt < 3000)
        );
        if (justResolved && justResolved.status === 'WIN' && soundEnabled) {
          sound.playWinChime();
        }
      }

      // STRICT VALIDATION: Check that API issue number is present
      if (!data.currentIssueNumber || data.currentIssueNumber.trim() === '') {
        throw new Error('API returned empty issue number. Issue synchronization failed.');
      }

      // Retrieve or generate prediction strictly matching the API issue number
      let activePred = reconciledPredictions.find(
        p => p.targetIssueNumber === data.currentIssueNumber && p.status === 'PENDING'
      );

      if (!activePred && data.history.length >= 3) {
        // Generate new prediction strictly for this API issue number using multi-model engine
        const newPred = wingoPredictor.generatePrediction(mode, data.currentIssueNumber, data.history, windowSize);
        if (newPred) {
          wingoStorage.savePrediction(mode, newPred);
          reconciledPredictions.unshift(newPred);
          activePred = newPred;
          if (soundEnabled && newPred.predictedOutcome !== 'NO_SIGNAL' && newPred.confidence >= 60) {
            sound.playSignalChime();
          }
        }
      }

      const updatedMetrics = wingoStorage.calculateMetrics(reconciledPredictions);

      const newState: ModeState = {
        currentIssueNumber: data.currentIssueNumber,
        serverRemainingSeconds: data.serverRemainingSeconds,
        cycleSeconds: data.cycleSeconds,
        isLocked: data.isLocked,
        history: data.history,
        predictions: reconciledPredictions,
        activePrediction: activePred || null,
        metrics: updatedMetrics,
        syncState: 'SYNCHRONIZED',
        errorMessage: '',
        lastSyncedAt: Date.now()
      };

      if (mode === '30s') {
        setState30s(newState);
      } else {
        setState1m(newState);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'DATA CONNECTION ERROR';
      const errorStateUpdate = (prev: ModeState): ModeState => ({
        ...prev,
        syncState: 'DATA_CONNECTION_ERROR',
        errorMessage: msg,
        activePrediction: null // Strictly block any prediction during connection failure
      });

      if (mode === '30s') {
        setState30s(errorStateUpdate);
      } else {
        setState1m(errorStateUpdate);
      }
    } finally {
      isSyncingRef.current[mode] = false;
    }
  }, [apiConfig, soundEnabled, windowSize]);

  // Initial sync on mount and when mode or config changes
  useEffect(() => {
    syncModeFromApi('30s');
    syncModeFromApi('1m');
  }, [syncModeFromApi]);

  // Second-by-second countdown and authoritative re-sync scheduler
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick 30s
      setState30s(prev => {
        if (prev.syncState === 'DATA_CONNECTION_ERROR') return prev;
        const remaining = Math.max(0, prev.serverRemainingSeconds - 1);
        if (soundEnabled && remaining <= 3 && remaining > 0) {
          sound.playCountdownTick(remaining === 1);
        }
        if (remaining === 0 && !isSyncingRef.current['30s']) {
          // Round completed: immediately re-sync from server API
          setTimeout(() => syncModeFromApi('30s'), 200);
        }
        return {
          ...prev,
          serverRemainingSeconds: remaining,
          isLocked: remaining <= 5
        };
      });

      // Tick 1m
      setState1m(prev => {
        if (prev.syncState === 'DATA_CONNECTION_ERROR') return prev;
        const remaining = Math.max(0, prev.serverRemainingSeconds - 1);
        if (remaining === 0 && !isSyncingRef.current['1m']) {
          // Round completed: immediately re-sync from server API
          setTimeout(() => syncModeFromApi('1m'), 200);
        }
        return {
          ...prev,
          serverRemainingSeconds: remaining,
          isLocked: remaining <= 5
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncModeFromApi, soundEnabled]);

  // Background drift sync every 6 seconds to prevent browser tab throttle drift
  useEffect(() => {
    const driftCheck = setInterval(() => {
      syncModeFromApi('30s');
      syncModeFromApi('1m');
    }, 6000);

    return () => clearInterval(driftCheck);
  }, [syncModeFromApi]);

  const updateApiConfig = (newCfg: Partial<WingoApiConfig>) => {
    const updated = { ...apiConfig, ...newCfg };
    setApiConfig(updated);
    wingoStorage.saveConfig(updated);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setMuted(!next);
  };

  const forceSyncCurrentMode = async () => {
    await syncModeFromApi(activeMode);
  };

  const testUpstreamEndpoint = async (url: string, token: string) => {
    return await wingoApi.testEndpoint(url, token);
  };

  const clearModeHistory = (mode: GameMode) => {
    wingoStorage.clearHistory(mode);
    if (mode === '30s') {
      setState30s(prev => ({
        ...prev,
        predictions: [],
        metrics: wingoStorage.calculateMetrics([])
      }));
    } else {
      setState1m(prev => ({
        ...prev,
        predictions: [],
        metrics: wingoStorage.calculateMetrics([])
      }));
    }
  };

  const currentModeState = activeMode === '30s' ? state30s : state1m;

  const currentMultiWindowAnalysis = wingoPredictor.analyzeMultiWindows(currentModeState.history);
  const currentBacktestSummary = wingoPredictor.runWalkForwardBacktest(currentModeState.history, windowSize);

  return (
    <WingoContext.Provider
      value={{
        activeMode,
        setActiveMode,
        state30s,
        state1m,
        currentModeState,
        apiConfig,
        updateApiConfig,
        soundEnabled,
        toggleSound,
        forceSyncCurrentMode,
        testUpstreamEndpoint,
        clearModeHistory,
        windowSize,
        setWindowSize,
        currentMultiWindowAnalysis,
        currentBacktestSummary
      }}
    >
      {children}
    </WingoContext.Provider>
  );
};

export const useWingo = () => {
  const context = useContext(WingoContext);
  if (!context) {
    throw new Error('useWingo must be used within a WingoProvider');
  }
  return context;
};
