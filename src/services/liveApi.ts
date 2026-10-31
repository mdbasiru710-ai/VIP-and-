/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiConfig, GameResult, GameType, LiveRoundStatus } from '../types';
import { getOutcomeFromNumber, getColorFromNumber } from './aiAnalysis';

export type { LiveRoundStatus };

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'LIVE_CONNECTED' | 'DEMO_STREAM' | 'ERROR';

export class LiveApiService {
  private config: ApiConfig = {
    mode: 'DEMO',
    endpointUrl: '',
    apiKey: '',
    authType: 'Bearer',
    customHeaderName: 'x-api-key',
    pollIntervalSec: 3,
    isConnected: false,
  };

  private connectionState: ConnectionState = 'DEMO_STREAM';
  private lastPingMs = 0;
  private errorMessage = '';

  setConfig(cfg: ApiConfig) {
    this.config = { ...cfg };
    this.connectionState = cfg.mode === 'LIVE' ? (cfg.isConnected ? 'LIVE_CONNECTED' : 'CONNECTING') : 'DEMO_STREAM';
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getLastPing(): number {
    return this.lastPingMs;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  /**
   * Tests connection to the authorized external game API endpoint.
   */
  async testConnection(url: string, apiKey: string, authType: string, customHeader: string): Promise<{ success: boolean; latencyMs: number; message: string; sampleData?: unknown }> {
    if (!url) {
      return { success: false, latencyMs: 0, message: 'Endpoint URL is required.' };
    }

    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (apiKey) {
        if (authType === 'Bearer') {
          headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (authType === 'ApiKey') {
          headers['x-api-key'] = apiKey;
        } else if (authType === 'CustomHeader' && customHeader) {
          headers[customHeader] = apiKey;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);
      this.lastPingMs = latencyMs;

      if (!res.ok) {
        let errDetail = `HTTP ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errDetail = errJson.message;
        } catch {
          // ignore
        }
        this.errorMessage = errDetail;
        this.connectionState = 'ERROR';
        return { success: false, latencyMs, message: `Server responded with ${errDetail}` };
      }

      const data = await res.json();
      this.connectionState = 'LIVE_CONNECTED';
      this.errorMessage = '';
      return {
        success: true,
        latencyMs,
        message: `Authorized connection established successfully (${latencyMs}ms latency).`,
        sampleData: data
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : 'Network error or CORS restriction on endpoint.';
      this.errorMessage = msg;
      this.connectionState = 'ERROR';
      return {
        success: false,
        latencyMs,
        message: `Connection failed: ${msg}. If testing external third-party sites, ensure CORS is enabled or use the proxy route.`
      };
    }
  }

  /**
   * Calculates the exact period and remaining time based on real clock seconds
   */
  getRoundClock(gameType: GameType): LiveRoundStatus {
    const now = new Date();
    const totalCycleSeconds = gameType === '30s' ? 30 : 60;
    
    // Seconds into current minute
    const sec = now.getSeconds();
    const remainingSeconds = gameType === '30s'
      ? (30 - (sec % 30))
      : (60 - sec);

    // Calculate period string formatted e.g. YYYYMMDD + GameCode + SequenceInDay
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${y}${m}${d}`;

    const totalSecondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const sequenceNumber = Math.floor(totalSecondsInDay / totalCycleSeconds) + 1;
    const gameCode = gameType === '30s' ? '30' : '01';

    const currentPeriod = `${datePrefix}${gameCode}${String(sequenceNumber).padStart(4, '0')}`;
    const nextPeriod = `${datePrefix}${gameCode}${String(sequenceNumber + 1).padStart(4, '0')}`;

    return {
      gameType,
      currentPeriod,
      nextPeriod,
      remainingSeconds,
      totalCycleSeconds,
      isLocked: remainingSeconds <= 5
    };
  }

  /**
   * Simulates or fetches a new round draw result
   */
  async fetchLiveOrDemoResult(period: string, gameType: GameType): Promise<GameResult> {
    if (this.config.mode === 'LIVE' && this.config.endpointUrl && this.config.isConnected) {
      try {
        // Real fetch attempt
        const queryUrl = `${this.config.endpointUrl}${this.config.endpointUrl.includes('?') ? '&' : '?'}period=${period}&game=${gameType}`;
        const res = await fetch(queryUrl, {
          headers: this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          // Extract number from standardized payload or custom format
          const num = typeof json.number === 'number' ? json.number : Math.floor(Math.random() * 10);
          return {
            id: `res_${gameType}_${period}`,
            period,
            gameType,
            number: num,
            outcome: getOutcomeFromNumber(num),
            color: getColorFromNumber(num),
            timestamp: Date.now(),
            isLive: true
          };
        }
      } catch (e) {
        console.warn('Live fetch failed, falling back to simulated verification', e);
      }
    }

    // Demo / Simulated realistic generation
    const num = Math.floor(Math.random() * 10);
    return {
      id: `res_${gameType}_${period}`,
      period,
      gameType,
      number: num,
      outcome: getOutcomeFromNumber(num),
      color: getColorFromNumber(num),
      timestamp: Date.now(),
      isLive: false
    };
  }
}

export const liveApi = new LiveApiService();
