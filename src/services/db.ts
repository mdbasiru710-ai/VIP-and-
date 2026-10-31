/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameResult, Signal, ApiConfig, UserSettings, GameType } from '../types';

const DB_NAME = 'aura_vip_db';
const DB_VERSION = 1;

const STORES = {
  RESULTS: 'game_results',
  SIGNALS: 'signals',
  CONFIG: 'config',
  SETTINGS: 'settings'
};

class DatabaseService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve) => {
      try {
        if (!window.indexedDB) {
          console.warn('IndexedDB not supported, falling back to LocalStorage');
          this.isInitialized = true;
          resolve();
          return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.warn('Failed to open IndexedDB, using LocalStorage fallback');
          this.isInitialized = true;
          resolve();
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(STORES.RESULTS)) {
            const resultsStore = db.createObjectStore(STORES.RESULTS, { keyPath: 'id' });
            resultsStore.createIndex('gameType', 'gameType', { unique: false });
            resultsStore.createIndex('period', 'period', { unique: false });
            resultsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORES.SIGNALS)) {
            const signalsStore = db.createObjectStore(STORES.SIGNALS, { keyPath: 'id' });
            signalsStore.createIndex('gameType', 'gameType', { unique: false });
            signalsStore.createIndex('period', 'period', { unique: false });
            signalsStore.createIndex('status', 'status', { unique: false });
            signalsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORES.CONFIG)) {
            db.createObjectStore(STORES.CONFIG, { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
          }
        };
      } catch (err) {
        console.error('Database init error:', err);
        this.isInitialized = true;
        resolve();
      }
    });
  }

  // GAME RESULTS
  async getResults(gameType?: GameType, limit = 100): Promise<GameResult[]> {
    await this.init();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(STORES.RESULTS, 'readonly');
          const store = tx.objectStore(STORES.RESULTS);
          const request = store.getAll();

          request.onsuccess = () => {
            let results: GameResult[] = request.result || [];
            if (gameType) {
              results = results.filter(r => r.gameType === gameType);
            }
            results.sort((a, b) => b.timestamp - a.timestamp);
            resolve(results.slice(0, limit));
          };

          request.onerror = () => {
            resolve(this.getResultsFromLocalStorage(gameType, limit));
          };
        } catch {
          resolve(this.getResultsFromLocalStorage(gameType, limit));
        }
      });
    }
    return this.getResultsFromLocalStorage(gameType, limit);
  }

  async saveResult(result: GameResult): Promise<void> {
    await this.init();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(STORES.RESULTS, 'readwrite');
          const store = tx.objectStore(STORES.RESULTS);
          store.put(result);
          tx.oncomplete = () => {
            this.syncResultToLocalStorage(result);
            resolve();
          };
          tx.onerror = () => {
            this.syncResultToLocalStorage(result);
            resolve();
          };
        } catch {
          this.syncResultToLocalStorage(result);
          resolve();
        }
      });
    }
    this.syncResultToLocalStorage(result);
  }

  async saveBatchResults(results: GameResult[]): Promise<void> {
    await this.init();
    for (const res of results) {
      await this.saveResult(res);
    }
  }

  // SIGNALS
  async getSignals(gameType?: GameType, limit = 100): Promise<Signal[]> {
    await this.init();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(STORES.SIGNALS, 'readonly');
          const store = tx.objectStore(STORES.SIGNALS);
          const request = store.getAll();

          request.onsuccess = () => {
            let signals: Signal[] = request.result || [];
            if (gameType) {
              signals = signals.filter(s => s.gameType === gameType);
            }
            signals.sort((a, b) => b.timestamp - a.timestamp);
            resolve(signals.slice(0, limit));
          };

          request.onerror = () => {
            resolve(this.getSignalsFromLocalStorage(gameType, limit));
          };
        } catch {
          resolve(this.getSignalsFromLocalStorage(gameType, limit));
        }
      });
    }
    return this.getSignalsFromLocalStorage(gameType, limit);
  }

  async saveSignal(signal: Signal): Promise<void> {
    await this.init();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(STORES.SIGNALS, 'readwrite');
          const store = tx.objectStore(STORES.SIGNALS);
          store.put(signal);
          tx.oncomplete = () => {
            this.syncSignalToLocalStorage(signal);
            resolve();
          };
          tx.onerror = () => {
            this.syncSignalToLocalStorage(signal);
            resolve();
          };
        } catch {
          this.syncSignalToLocalStorage(signal);
          resolve();
        }
      });
    }
    this.syncSignalToLocalStorage(signal);
  }

  async updateSignalStatus(period: string, gameType: GameType, actualNumber: number, actualOutcome: 'BIG' | 'SMALL'): Promise<Signal | null> {
    const signals = await this.getSignals();
    const targetSignal = signals.find(s => s.period === period && s.gameType === gameType && s.status === 'PENDING');
    if (!targetSignal) return null;

    targetSignal.actualNumber = actualNumber;
    targetSignal.actualOutcome = actualOutcome;
    targetSignal.status = (targetSignal.predictedOutcome === actualOutcome) ? 'WIN' : 'LOSS';

    await this.saveSignal(targetSignal);
    return targetSignal;
  }

  // API CONFIG & SETTINGS
  async getConfig(): Promise<ApiConfig> {
    const fallback: ApiConfig = {
      mode: 'DEMO',
      endpointUrl: 'https://api.game-results-hub.org/v1/wingo',
      apiKey: '',
      authType: 'Bearer',
      customHeaderName: 'x-api-key',
      pollIntervalSec: 3,
      isConnected: false,
    };
    try {
      const stored = localStorage.getItem('aura_api_config');
      return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
    } catch {
      return fallback;
    }
  }

  async saveConfig(config: ApiConfig): Promise<void> {
    try {
      localStorage.setItem('aura_api_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }

  async getSettings(): Promise<UserSettings> {
    const fallback: UserSettings = {
      soundEnabled: true,
      hapticsEnabled: true,
      soundVolume: 0.8,
      minConfidenceAlert: 65,
      unitSize: 10,
      vipTier: 'PLATINUM',
      themeAccent: 'GOLD'
    };
    try {
      const stored = localStorage.getItem('aura_user_settings');
      return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
    } catch {
      return fallback;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      localStorage.setItem('aura_user_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }

  // BACKUP & EXPORT
  async exportAllData(): Promise<string> {
    const results = await this.getResults(undefined, 1000);
    const signals = await this.getSignals(undefined, 1000);
    const config = await this.getConfig();
    const settings = await this.getSettings();

    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      results,
      signals,
      config,
      settings
    };

    return JSON.stringify(data, null, 2);
  }

  async exportResultsCsv(): Promise<string> {
    const signals = await this.getSignals(undefined, 1000);
    const headers = ['Period', 'Game', 'Timestamp', 'Signal', 'Confidence', 'Actual Num', 'Actual Outcome', 'Result', 'Pattern'];
    const rows = signals.map(s => [
      s.period,
      s.gameType,
      new Date(s.timestamp).toISOString(),
      s.predictedOutcome,
      `${s.confidence}%`,
      s.actualNumber ?? 'N/A',
      s.actualOutcome ?? 'N/A',
      s.status,
      `"${s.patternDetected.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.results)) {
        await this.saveBatchResults(data.results);
      }
      if (Array.isArray(data.signals)) {
        for (const sig of data.signals) {
          await this.saveSignal(sig);
        }
      }
      if (data.config) await this.saveConfig(data.config);
      if (data.settings) await this.saveSettings(data.settings);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    await this.init();
    if (this.db) {
      try {
        const tx = this.db.transaction([STORES.RESULTS, STORES.SIGNALS], 'readwrite');
        tx.objectStore(STORES.RESULTS).clear();
        tx.objectStore(STORES.SIGNALS).clear();
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('aura_results_cache');
    localStorage.removeItem('aura_signals_cache');
  }

  // LocalStorage Helpers
  private getResultsFromLocalStorage(gameType?: GameType, limit = 100): GameResult[] {
    try {
      const cached = localStorage.getItem('aura_results_cache');
      let items: GameResult[] = cached ? JSON.parse(cached) : [];
      if (gameType) items = items.filter(r => r.gameType === gameType);
      items.sort((a, b) => b.timestamp - a.timestamp);
      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  private syncResultToLocalStorage(result: GameResult): void {
    try {
      const items = this.getResultsFromLocalStorage();
      const existingIdx = items.findIndex(i => i.id === result.id);
      if (existingIdx >= 0) {
        items[existingIdx] = result;
      } else {
        items.unshift(result);
      }
      localStorage.setItem('aura_results_cache', JSON.stringify(items.slice(0, 300)));
    } catch (e) {
      console.error(e);
    }
  }

  private getSignalsFromLocalStorage(gameType?: GameType, limit = 100): Signal[] {
    try {
      const cached = localStorage.getItem('aura_signals_cache');
      let items: Signal[] = cached ? JSON.parse(cached) : [];
      if (gameType) items = items.filter(s => s.gameType === gameType);
      items.sort((a, b) => b.timestamp - a.timestamp);
      return items.slice(0, limit);
    } catch {
      return [];
    }
  }

  private syncSignalToLocalStorage(signal: Signal): void {
    try {
      const items = this.getSignalsFromLocalStorage();
      const existingIdx = items.findIndex(i => i.id === signal.id);
      if (existingIdx >= 0) {
        items[existingIdx] = signal;
      } else {
        items.unshift(signal);
      }
      localStorage.setItem('aura_signals_cache', JSON.stringify(items.slice(0, 300)));
    } catch (e) {
      console.error(e);
    }
  }
}

export const dbService = new DatabaseService();
