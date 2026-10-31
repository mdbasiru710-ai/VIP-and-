/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = '30s' | '1m';
export type OutcomeType = 'BIG' | 'SMALL';
export type PredictedSignalType = 'BIG' | 'SMALL' | 'NO_SIGNAL';
export type ColorType = 'RED' | 'GREEN' | 'VIOLET' | 'RED_VIOLET' | 'GREEN_VIOLET';
export type PredictionStatus = 'WIN' | 'LOSS' | 'PENDING' | 'VOID';
export type ApiSyncState = 'SYNCHRONIZED' | 'SYNCING' | 'DATA_CONNECTION_ERROR';

export interface SettledDraw {
  issueNumber: string;
  number: number;
  outcome: OutcomeType;
  color: ColorType;
  settledAt: number;
}

export interface WingoApiSyncResponse {
  success: boolean;
  game: GameMode;
  currentIssueNumber: string;
  serverRemainingSeconds: number;
  serverTimestamp: number;
  cycleSeconds: number;
  isLocked: boolean;
  latestSettledRound: SettledDraw | null;
  history: SettledDraw[];
  source: string;
  error?: string;
  message?: string;
}

export interface ModelComparisonResult {
  modelId: string;
  modelName: string;
  description: string;
  walkForwardWinRate: number; // in percentage e.g. 68.4
  sampleTested: number;
  signalsCount: number;
  wins: number;
  losses: number;
  isOptimal: boolean;
}

export interface MultiWindowAnalysis {
  w100: { bigPct: number; smallPct: number; zScore: number; streakCount: number };
  w200: { bigPct: number; smallPct: number; zScore: number; streakCount: number };
  w500: { bigPct: number; smallPct: number; zScore: number; streakCount: number };
}

export interface WingoPrediction {
  id: string;
  game: GameMode;
  targetIssueNumber: string; // The exact API issue number verified from server
  predictedOutcome: PredictedSignalType; // BIG, SMALL, or NO_SIGNAL
  bigProbability: number;
  smallProbability: number;
  confidence: number;
  aiScore: number; // 0 to 100 AI Analysis Quality Score
  selectedModel: string;
  windowSize: 100 | 200 | 500;
  patternDetected: string;
  recommendedUnit: '1x' | '2x' | 'PASS';
  rationale: string;
  status: PredictionStatus;
  actualNumber?: number;
  actualOutcome?: OutcomeType;
  createdAt: number;
  verifiedAt?: number;
}

export interface ModePerformanceMetrics {
  totalPredictions: number;
  totalWins: number;
  totalLosses: number;
  pending: number;
  winRate: number; // e.g. 68.5%
  rolling100WinRate: number; // Rolling accuracy over last 100 settled predictions
  experimentalTarget: number; // 70% benchmark
  currentStreak: number;
  maxWinStreak: number;
}

export interface WingoApiConfig {
  externalUrl: string;
  authToken: string;
  pollingIntervalSec: number;
  useCustomUpstream: boolean;
}

export type GameType = '30s' | '1m';
export type SignalStatus = 'WIN' | 'LOSS' | 'PENDING';

export interface LiveRoundStatus {
  gameType: GameType;
  currentPeriod: string;
  nextPeriod: string;
  remainingSeconds: number;
  totalCycleSeconds: number;
  isLocked: boolean;
}

export interface GameResult {
  id: string;
  period: string;
  gameType: GameType;
  number: number;
  outcome: OutcomeType;
  color: ColorType;
  timestamp: number;
  isLive: boolean;
}

export interface Signal {
  id: string;
  period: string;
  gameType: GameType;
  predictedOutcome: OutcomeType;
  bigProbability: number;
  smallProbability: number;
  confidence: number;
  patternDetected: string;
  recommendedUnit: '1x' | '2x' | '3x' | 'PASS';
  rationale: string;
  status: SignalStatus;
  actualNumber?: number;
  actualOutcome?: OutcomeType;
  timestamp: number;
  isLive: boolean;
}

export interface ApiConfig {
  mode: 'DEMO' | 'LIVE';
  endpointUrl: string;
  apiKey: string;
  authType: 'Bearer' | 'ApiKey' | 'CustomHeader';
  customHeaderName: string;
  pollIntervalSec: number;
  isConnected: boolean;
  lastCheckedAt?: number;
  lastLatencyMs?: number;
  lastError?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  soundVolume: number;
  minConfidenceAlert: number;
  unitSize: number;
  vipTier: 'GOLD' | 'PLATINUM' | 'DIAMOND';
  themeAccent: 'GOLD' | 'AMBER' | 'CHAMPAGNE';
}

export interface MarkovMatrix {
  bigToBig: number;
  bigToSmall: number;
  smallToBig: number;
  smallToSmall: number;
}

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastSeenRoundsAgo: number;
  isHot: boolean;
  isCold: boolean;
}

export interface PerformanceMetrics {
  totalSignals: number;
  totalWins: number;
  totalLosses: number;
  totalPending: number;
  winRate: number;
  currentStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  thirtySecWinRate: number;
  oneMinWinRate: number;
  simulatedProfitUnits: number;
  todayWinRate: number;
}
