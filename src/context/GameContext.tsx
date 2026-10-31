/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { GameResult, Signal, ApiConfig, UserSettings, PerformanceMetrics, GameType } from '../types';
import { dbService } from '../services/db';
import { liveApi, LiveRoundStatus, ConnectionState } from '../services/liveApi';
import { AiAnalysisEngine } from '../services/aiAnalysis';
import { generateSeedData } from '../services/mockData';
import { sound } from '../services/audio';

interface GameContextType {
  results: GameResult[];
  signals: Signal[];
  metrics: PerformanceMetrics;
  apiConfig: ApiConfig;
  userSettings: UserSettings;
  clock30s: LiveRoundStatus;
  clock1m: LiveRoundStatus;
  active30sSignal: Signal | null;
  active1mSignal: Signal | null;
  connectionState: ConnectionState;
  lastPingMs: number;
  apiError: string;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateConfig: (newConfig: Partial<ApiConfig>) => Promise<void>;
  testConnection: (url: string, apiKey: string, authType: string, customHeader: string) => Promise<{ success: boolean; latencyMs: number; message: string; sampleData?: unknown }>;
  resetDatabase: () => Promise<void>;
  exportData: (format: 'json' | 'csv') => Promise<string>;
  importData: (content: string) => Promise<boolean>;
  manualDrawNow: (gameType: GameType) => Promise<void>;
  refreshSignals: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalSignals: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPending: 0,
    winRate: 0,
    currentStreak: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    thirtySecWinRate: 0,
    oneMinWinRate: 0,
    simulatedProfitUnits: 0,
    todayWinRate: 0
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    mode: 'DEMO',
    endpointUrl: '',
    apiKey: '',
    authType: 'Bearer',
    customHeaderName: 'x-api-key',
    pollIntervalSec: 3,
    isConnected: false,
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
    soundVolume: 0.8,
    minConfidenceAlert: 65,
    unitSize: 10,
    vipTier: 'PLATINUM',
    themeAccent: 'GOLD'
  });

  const [clock30s, setClock30s] = useState<LiveRoundStatus>(liveApi.getRoundClock('30s'));
  const [clock1m, setClock1m] = useState<LiveRoundStatus>(liveApi.getRoundClock('1m'));
  const [active30sSignal, setActive30sSignal] = useState<Signal | null>(null);
  const [active1mSignal, setActive1mSignal] = useState<Signal | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DEMO_STREAM');
  const [lastPingMs, setLastPingMs] = useState(0);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const prev30sPeriodRef = useRef<string>('');
  const prev1mPeriodRef = useRef<string>('');
  const isResolvingRef = useRef<{ '30s': boolean; '1m': boolean }>({ '30s': false, '1m': false });

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await dbService.init();

      let loadedResults = await dbService.getResults(undefined, 100);
      let loadedSignals = await dbService.getSignals(undefined, 100);
      const loadedConfig = await dbService.getConfig();
      const loadedSettings = await dbService.getSettings();

      // Seed initial data if empty
      if (loadedResults.length === 0) {
        const seed = generateSeedData();
        await dbService.saveBatchResults(seed.results);
        for (const s of seed.signals) {
          await dbService.saveSignal(s);
        }
        loadedResults = seed.results;
        loadedSignals = seed.signals;
      }

      setResults(loadedResults);
      setSignals(loadedSignals);
      setApiConfig(loadedConfig);
      setUserSettings(loadedSettings);

      liveApi.setConfig(loadedConfig);
      sound.setMuted(!loadedSettings.soundEnabled);
      sound.setVolume(loadedSettings.soundVolume);

      // Setup initial active signals for the current upcoming periods
      const initialClock30 = liveApi.getRoundClock('30s');
      const initialClock1 = liveApi.getRoundClock('1m');
      setClock30s(initialClock30);
      setClock1m(initialClock1);
      prev30sPeriodRef.current = initialClock30.currentPeriod;
      prev1mPeriodRef.current = initialClock1.currentPeriod;

      const history30s = loadedResults.filter(r => r.gameType === '30s');
      const history1m = loadedResults.filter(r => r.gameType === '1m');

      // Check if there is already an active pending signal for currentPeriod
      let sig30 = loadedSignals.find(s => s.period === initialClock30.currentPeriod && s.gameType === '30s' && s.status === 'PENDING');
      if (!sig30) {
        sig30 = AiAnalysisEngine.generateSignal(history30s, initialClock30.currentPeriod, '30s', loadedConfig.mode === 'LIVE');
        await dbService.saveSignal(sig30);
        loadedSignals.unshift(sig30);
      }
      setActive30sSignal(sig30);

      let sig1m = loadedSignals.find(s => s.period === initialClock1.currentPeriod && s.gameType === '1m' && s.status === 'PENDING');
      if (!sig1m) {
        sig1m = AiAnalysisEngine.generateSignal(history1m, initialClock1.currentPeriod, '1m', loadedConfig.mode === 'LIVE');
        await dbService.saveSignal(sig1m);
        loadedSignals.unshift(sig1m);
      }
      setActive1mSignal(sig1m);

      setSignals([...loadedSignals]);
      setMetrics(AiAnalysisEngine.calculateMetrics(loadedSignals));
      setIsLoading(false);
    }

    loadData();
  }, []);

  // Sync sound settings
  useEffect(() => {
    sound.setMuted(!userSettings.soundEnabled);
    sound.setVolume(userSettings.soundVolume);
  }, [userSettings.soundEnabled, userSettings.soundVolume]);

  // Main Live Second Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const c30 = liveApi.getRoundClock('30s');
      const c1m = liveApi.getRoundClock('1m');

      setClock30s(c30);
      setClock1m(c1m);

      // Sound ticks for final 5 seconds
      if (userSettings.soundEnabled) {
        if (c30.remainingSeconds <= 3 && c30.remainingSeconds > 0) {
          sound.playCountdownTick(c30.remainingSeconds === 1);
        }
      }

      // 30s Game Resolution Trigger
      if (c30.currentPeriod !== prev30sPeriodRef.current && !isResolvingRef.current['30s']) {
        const resolvingPeriod = prev30sPeriodRef.current;
        prev30sPeriodRef.current = c30.currentPeriod;
        if (resolvingPeriod) {
          handlePeriodResolution(resolvingPeriod, '30s', c30.currentPeriod);
        }
      }

      // 1m Game Resolution Trigger
      if (c1m.currentPeriod !== prev1mPeriodRef.current && !isResolvingRef.current['1m']) {
        const resolvingPeriod = prev1mPeriodRef.current;
        prev1mPeriodRef.current = c1m.currentPeriod;
        if (resolvingPeriod) {
          handlePeriodResolution(resolvingPeriod, '1m', c1m.currentPeriod);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [userSettings.soundEnabled]);

  // Handle Round End & AI Signal Generation for next round
  const handlePeriodResolution = async (period: string, gameType: '30s' | '1m', nextPeriod: string) => {
    isResolvingRef.current[gameType] = true;
    try {
      // 1. Fetch or simulate draw result
      const newResult = await liveApi.fetchLiveOrDemoResult(period, gameType);
      await dbService.saveResult(newResult);

      // 2. Resolve pending signal
      const updatedSignal = await dbService.updateSignalStatus(
        period,
        gameType,
        newResult.number,
        newResult.outcome
      );

      if (updatedSignal && updatedSignal.status === 'WIN') {
        if (userSettings.soundEnabled) sound.playWinChime();
        if (userSettings.hapticsEnabled) sound.triggerHaptic(50);
      }

      // 3. Fetch refreshed results & history
      const freshResults = await dbService.getResults(undefined, 100);
      const freshSignals = await dbService.getSignals(undefined, 100);

      // 4. Generate AI Prediction for the new upcoming period
      const gameHistory = freshResults.filter(r => r.gameType === gameType);
      const newSignal = AiAnalysisEngine.generateSignal(
        gameHistory,
        nextPeriod,
        gameType,
        apiConfig.mode === 'LIVE'
      );
      await dbService.saveSignal(newSignal);
      freshSignals.unshift(newSignal);

      // Sound notification for new VIP signal
      if (userSettings.soundEnabled && newSignal.confidence >= userSettings.minConfidenceAlert) {
        setTimeout(() => sound.playSignalChime(), 600);
      }

      // 5. Update State
      setResults(freshResults);
      setSignals([...freshSignals]);
      setMetrics(AiAnalysisEngine.calculateMetrics(freshSignals));

      if (gameType === '30s') {
        setActive30sSignal(newSignal);
      } else {
        setActive1mSignal(newSignal);
      }
    } catch (e) {
      console.error(`Error resolving period ${period} for ${gameType}:`, e);
    } finally {
      isResolvingRef.current[gameType] = false;
    }
  };

  const manualDrawNow = async (gameType: GameType) => {
    const clock = gameType === '30s' ? clock30s : clock1m;
    await handlePeriodResolution(clock.currentPeriod, gameType, clock.nextPeriod);
  };

  const refreshSignals = async () => {
    const loadedSignals = await dbService.getSignals(undefined, 100);
    const loadedResults = await dbService.getResults(undefined, 100);
    setSignals(loadedSignals);
    setResults(loadedResults);
    setMetrics(AiAnalysisEngine.calculateMetrics(loadedSignals));
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);
    await dbService.saveSettings(updated);
  };

  const updateConfig = async (newConfig: Partial<ApiConfig>) => {
    const updated = { ...apiConfig, ...newConfig };
    setApiConfig(updated);
    liveApi.setConfig(updated);
    setConnectionState(liveApi.getConnectionState());
    await dbService.saveConfig(updated);
  };

  const testConnection = async (url: string, apiKey: string, authType: string, customHeader: string) => {
    const result = await liveApi.testConnection(url, apiKey, authType, customHeader);
    setLastPingMs(result.latencyMs);
    if (result.success) {
      setConnectionState('LIVE_CONNECTED');
      setApiError('');
      await updateConfig({ isConnected: true, endpointUrl: url, apiKey, authType: authType as ApiConfig['authType'], customHeaderName: customHeader });
    } else {
      setConnectionState('ERROR');
      setApiError(result.message);
      await updateConfig({ isConnected: false });
    }
    return result;
  };

  const resetDatabase = async () => {
    await dbService.clearAllData();
    const seed = generateSeedData();
    await dbService.saveBatchResults(seed.results);
    for (const s of seed.signals) {
      await dbService.saveSignal(s);
    }
    setResults(seed.results);
    setSignals(seed.signals);
    setMetrics(AiAnalysisEngine.calculateMetrics(seed.signals));
  };

  const exportData = async (format: 'json' | 'csv') => {
    if (format === 'json') {
      return await dbService.exportAllData();
    } else {
      return await dbService.exportResultsCsv();
    }
  };

  const importData = async (content: string) => {
    const ok = await dbService.importData(content);
    if (ok) {
      await refreshSignals();
    }
    return ok;
  };

  return (
    <GameContext.Provider
      value={{
        results,
        signals,
        metrics,
        apiConfig,
        userSettings,
        clock30s,
        clock1m,
        active30sSignal,
        active1mSignal,
        connectionState,
        lastPingMs,
        apiError,
        isLoading,
        activeTab,
        setActiveTab,
        updateSettings,
        updateConfig,
        testConnection,
        resetDatabase,
        exportData,
        importData,
        manualDrawNow,
        refreshSignals,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
