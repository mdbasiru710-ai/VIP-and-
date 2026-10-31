/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameResult, Signal, GameType } from '../types';
import { getOutcomeFromNumber, getColorFromNumber, AiAnalysisEngine } from './aiAnalysis';

export function generateSeedData(): { results: GameResult[]; signals: Signal[] } {
  const results: GameResult[] = [];
  const signals: Signal[] = [];

  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const createRounds = (gameType: GameType, cycleSec: number, count: number) => {
    let prevPeriodNum = 1000;
    const gameResults: GameResult[] = [];

    // Pre-determine a sequence that has natural streaks, dragons, and alternating patterns
    const numbersPool = [
      7, 8, 9, 6, 8, // Dragon Big (5x)
      2, 4, 1, 3,    // Dragon Small (4x)
      6, 1, 8, 3, 9, 2, // Alternating (6x)
      5, 7, 0, 4, 8, 9, 2, 6, 1, 3, 5, 8, 2, 7, 1, 6, 4, 9, 0, 8, 3, 7, 5, 2, 4, 6, 8, 1, 9, 3, 7, 4, 8, 2, 5, 6
    ];

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - i * (cycleSec * 1000);
      const period = `${todayStr}${gameType === '30s' ? '30' : '01'}${prevPeriodNum + (count - i)}`;
      const num = numbersPool[i % numbersPool.length];
      const outcome = getOutcomeFromNumber(num);
      const color = getColorFromNumber(num);

      const res: GameResult = {
        id: `res_${gameType}_${period}`,
        period,
        gameType,
        number: num,
        outcome,
        color,
        timestamp,
        isLive: false,
      };

      gameResults.push(res);
      results.push(res);
    }

    // Now generate historical signals based on rolling windows
    for (let i = 5; i < gameResults.length; i++) {
      const historySlice = gameResults.slice(0, i);
      const targetRes = gameResults[i];
      // Generate prediction based on history slice
      const signal = AiAnalysisEngine.generateSignal(
        [...historySlice].reverse(),
        targetRes.period,
        gameType,
        false
      );

      signal.timestamp = targetRes.timestamp - 5000; // predicted 5s before result
      signal.actualNumber = targetRes.number;
      signal.actualOutcome = targetRes.outcome;
      signal.status = signal.predictedOutcome === targetRes.outcome ? 'WIN' : 'LOSS';

      signals.push(signal);
    }
  };

  createRounds('30s', 30, 45);
  createRounds('1m', 60, 40);

  // Sort newest first
  results.sort((a, b) => b.timestamp - a.timestamp);
  signals.sort((a, b) => b.timestamp - a.timestamp);

  return { results, signals };
}
