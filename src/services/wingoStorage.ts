/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, WingoPrediction, SettledDraw, ModePerformanceMetrics, WingoApiConfig } from '../types';

export class WingoStorageService {
  private getPredictionsKey(mode: GameMode): string {
    return `wingo_predictions_${mode}`;
  }

  private getConfigKey(): string {
    return 'wingo_api_config';
  }

  getPredictions(mode: GameMode): WingoPrediction[] {
    try {
      const stored = localStorage.getItem(this.getPredictionsKey(mode));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  savePrediction(mode: GameMode, prediction: WingoPrediction): void {
    try {
      const list = this.getPredictions(mode);
      const idx = list.findIndex(p => p.targetIssueNumber === prediction.targetIssueNumber);
      if (idx >= 0) {
        list[idx] = prediction;
      } else {
        list.unshift(prediction);
      }
      localStorage.setItem(this.getPredictionsKey(mode), JSON.stringify(list.slice(0, 150)));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  /**
   * Matches pending predictions against actual settled draw results from API.
   * Updates status to WIN or LOSS (or VOID if NO_SIGNAL) based on target issue number.
   */
  reconcilePredictionsWithHistory(mode: GameMode, history: SettledDraw[]): WingoPrediction[] {
    const list = this.getPredictions(mode);
    let updated = false;

    for (const pred of list) {
      if (pred.status === 'PENDING') {
        const settled = history.find(h => h.issueNumber === pred.targetIssueNumber);
        if (settled) {
          pred.actualNumber = settled.number;
          pred.actualOutcome = settled.outcome;

          if (pred.predictedOutcome === 'NO_SIGNAL') {
            pred.status = 'VOID';
          } else {
            pred.status = pred.predictedOutcome === settled.outcome ? 'WIN' : 'LOSS';
          }

          pred.verifiedAt = Date.now();
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem(this.getPredictionsKey(mode), JSON.stringify(list));
    }

    return list;
  }

  calculateMetrics(predictions: WingoPrediction[]): ModePerformanceMetrics {
    const completed = predictions.filter(p => p.status === 'WIN' || p.status === 'LOSS');
    const totalWins = completed.filter(p => p.status === 'WIN').length;
    const totalLosses = completed.filter(p => p.status === 'LOSS').length;
    const pending = predictions.filter(p => p.status === 'PENDING').length;
    const winRate = completed.length > 0 ? Math.round((totalWins / completed.length) * 1000) / 10 : 0;

    // Rolling 100 settled predictions accuracy
    const last100 = completed.slice(0, 100);
    const last100Wins = last100.filter(p => p.status === 'WIN').length;
    const rolling100WinRate = last100.length > 0 ? Math.round((last100Wins / last100.length) * 1000) / 10 : winRate;

    // Streaks in chronological order
    const chronological = [...completed].sort((a, b) => a.createdAt - b.createdAt);
    let currentStreak = 0;
    let maxWinStreak = 0;
    let tempWin = 0;

    for (const p of chronological) {
      if (p.status === 'WIN') {
        tempWin++;
        if (tempWin > maxWinStreak) maxWinStreak = tempWin;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        tempWin = 0;
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }
    }

    return {
      totalPredictions: predictions.length,
      totalWins,
      totalLosses,
      pending,
      winRate,
      rolling100WinRate,
      experimentalTarget: 70.0,
      currentStreak,
      maxWinStreak
    };
  }

  getConfig(): WingoApiConfig {
    const fallback: WingoApiConfig = {
      externalUrl: '',
      authToken: '',
      pollingIntervalSec: 2,
      useCustomUpstream: false
    };
    try {
      const stored = localStorage.getItem(this.getConfigKey());
      return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
    } catch {
      return fallback;
    }
  }

  saveConfig(cfg: WingoApiConfig): void {
    try {
      localStorage.setItem(this.getConfigKey(), JSON.stringify(cfg));
    } catch (e) {
      console.error(e);
    }
  }

  clearHistory(mode: GameMode): void {
    localStorage.removeItem(this.getPredictionsKey(mode));
  }
}

export const wingoStorage = new WingoStorageService();
