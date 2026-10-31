/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWingo } from '../context/WingoContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { BarChart3, TrendingUp, Flame, Award, Zap, Clock, ShieldCheck, Target, Layers } from 'lucide-react';
import { WingoPrediction, SettledDraw } from '../types';

interface ModeStatsData {
  wins: number;
  losses: number;
  winRate: number;
  maxWinStreak: number;
  currentStreak: number;
  streakDist: { name: string; count: number }[];
  cumulativePnl: { round: string; cumulativeWins: number; winRate: number }[];
  outcomeDist: { name: string; count: number }[];
}

function computeDetailedStats(predictions: WingoPrediction[], history: SettledDraw[]): ModeStatsData {
  const completed = predictions.filter(p => p.status === 'WIN' || p.status === 'LOSS');
  const wins = completed.filter(p => p.status === 'WIN').length;
  const losses = completed.filter(p => p.status === 'LOSS').length;
  const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 1000) / 10 : 0;

  // Streaks calculation
  const chronological = [...completed].sort((a, b) => a.createdAt - b.createdAt);
  let currentStreak = 0;
  let maxWinStreak = 0;
  let tempWin = 0;
  const streakBuckets: Record<string, number> = {
    '1 Win': 0,
    '2 Wins': 0,
    '3 Wins': 0,
    '4+ Wins': 0,
    '1 Loss': 0,
    '2+ Losses': 0
  };

  let runType: 'WIN' | 'LOSS' | null = null;
  let runLength = 0;

  for (const p of chronological) {
    if (p.status === 'WIN') {
      tempWin++;
      if (tempWin > maxWinStreak) maxWinStreak = tempWin;
      currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;

      if (runType === 'WIN') {
        runLength++;
      } else {
        if (runType === 'LOSS') {
          if (runLength === 1) streakBuckets['1 Loss']++;
          else streakBuckets['2+ Losses']++;
        }
        runType = 'WIN';
        runLength = 1;
      }
    } else {
      tempWin = 0;
      currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;

      if (runType === 'LOSS') {
        runLength++;
      } else {
        if (runType === 'WIN') {
          if (runLength === 1) streakBuckets['1 Win']++;
          else if (runLength === 2) streakBuckets['2 Wins']++;
          else if (runLength === 3) streakBuckets['3 Wins']++;
          else streakBuckets['4+ Wins']++;
        }
        runType = 'LOSS';
        runLength = 1;
      }
    }
  }

  // Final run tally
  if (runType === 'WIN') {
    if (runLength === 1) streakBuckets['1 Win']++;
    else if (runLength === 2) streakBuckets['2 Wins']++;
    else if (runLength === 3) streakBuckets['3 Wins']++;
    else streakBuckets['4+ Wins']++;
  } else if (runType === 'LOSS') {
    if (runLength === 1) streakBuckets['1 Loss']++;
    else streakBuckets['2+ Losses']++;
  }

  const streakDist = Object.entries(streakBuckets).map(([name, count]) => ({ name, count }));

  // Cumulative performance over rounds
  let runningWins = 0;
  const cumulativePnl = chronological.slice(-20).map((p, idx) => {
    if (p.status === 'WIN') runningWins++;
    const rate = Math.round((runningWins / (idx + 1)) * 100);
    return {
      round: `#${p.targetIssueNumber.slice(-4)}`,
      cumulativeWins: runningWins,
      winRate: rate
    };
  });

  // Outcome distribution from history
  const bigCount = history.filter(h => h.outcome === 'BIG').length;
  const smallCount = history.filter(h => h.outcome === 'SMALL').length;
  const outcomeDist = [
    { name: 'BIG (5-9)', count: bigCount },
    { name: 'SMALL (0-4)', count: smallCount }
  ];

  return {
    wins,
    losses,
    winRate,
    maxWinStreak,
    currentStreak,
    streakDist,
    cumulativePnl,
    outcomeDist
  };
}

const GOLD_COLORS = ['#d4af37', '#f43f5e'];
const OUTCOME_COLORS = ['#f5d77f', '#38bdf8'];

// Custom Dark/Gold Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-gold rounded-xl p-2.5 border border-[#d4af37]/40 shadow-xl text-xs font-mono">
        {label && <div className="font-bold text-[#ede8dc] mb-1">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color || entry.fill }}>
            <span className="font-semibold">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView: React.FC = () => {
  const { state30s, state1m } = useWingo();
  const [selectedTab, setSelectedTab] = useState<'30s' | '1m' | 'COMPARISON'>('COMPARISON');

  const stats30s = computeDetailedStats(state30s.predictions, state30s.history);
  const stats1m = computeDetailedStats(state1m.predictions, state1m.history);

  const pieData30s = [
    { name: 'WIN', value: stats30s.wins || 1 },
    { name: 'LOSS', value: stats30s.losses || 0 }
  ];

  const pieData1m = [
    { name: 'WIN', value: stats1m.wins || 1 },
    { name: 'LOSS', value: stats1m.losses || 0 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#f5d77f]" />
            <h1 className="font-serif text-2xl font-bold text-gold-gradient">
              Historical Win / Loss & Streak Analytics
            </h1>
          </div>
          <p className="text-xs text-[#999080] mt-0.5">
            Strictly separated statistical performance curves and streak distributions for 30s and 1m modes.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#090b10] p-1 rounded-xl border border-white/10 self-start sm:self-auto text-xs">
          <button
            onClick={() => setSelectedTab('COMPARISON')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedTab === 'COMPARISON'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setSelectedTab('30s')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedTab === '30s'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            WinGo 30s
          </button>
          <button
            onClick={() => setSelectedTab('1m')}
            className={`px-3 py-1.5 font-bold rounded-lg transition ${
              selectedTab === '1m'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#8c8475] hover:text-[#ede8dc]'
            }`}
          >
            WinGo 1m
          </button>
        </div>
      </div>

      {/* KPI Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel-gold rounded-xl p-4 border border-[#d4af37]/30">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>30s Win Rate</span>
            <Clock className="h-3.5 w-3.5 text-[#f5d77f]" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-emerald-400">
            {stats30s.winRate}%
          </div>
          <div className="text-[10px] text-[#787163] mt-1">
            {stats30s.wins}W / {stats30s.losses}L ({state30s.predictions.length} total)
          </div>
        </div>

        <div className="glass-panel-gold rounded-xl p-4 border border-sky-400/30">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>1m Win Rate</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-emerald-400">
            {stats1m.winRate}%
          </div>
          <div className="text-[10px] text-[#787163] mt-1">
            {stats1m.wins}W / {stats1m.losses}L ({state1m.predictions.length} total)
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Max Win Streak (30s)</span>
            <Flame className="h-3.5 w-3.5 text-[#f5d77f]" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#f5d77f]">
            {stats30s.maxWinStreak} <span className="text-xs font-normal text-[#8c8475]">Rounds</span>
          </div>
          <div className="text-[10px] text-[#787163] mt-1">
            Current: {stats30s.currentStreak > 0 ? `+${stats30s.currentStreak}W` : `${stats30s.currentStreak}L`}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-[#8c8475] mb-1">
            <span>Max Win Streak (1m)</span>
            <Flame className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-sky-300">
            {stats1m.maxWinStreak} <span className="text-xs font-normal text-[#8c8475]">Rounds</span>
          </div>
          <div className="text-[10px] text-[#787163] mt-1">
            Current: {stats1m.currentStreak > 0 ? `+${stats1m.currentStreak}W` : `${stats1m.currentStreak}L`}
          </div>
        </div>
      </div>

      {/* Row 1: Historical Win / Loss Donut Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30s Pie Chart */}
        {(selectedTab === 'COMPARISON' || selectedTab === '30s') && (
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#d4af37]/20 text-[10px] font-mono font-bold text-[#f5d77f]">
                  30s
                </span>
                <h3 className="font-serif text-sm font-bold text-[#ede8dc]">
                  WinGo 30s Win / Loss Ratio
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {stats30s.winRate}% Accuracy
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData30s}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData30s.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} stroke="#090b10" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center font-mono text-xs text-[#8c8475]">
              {stats30s.wins} Wins · {stats30s.losses} Losses
            </div>
          </div>
        )}

        {/* 1m Pie Chart */}
        {(selectedTab === 'COMPARISON' || selectedTab === '1m') && (
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-500/20 text-[10px] font-mono font-bold text-sky-400">
                  1m
                </span>
                <h3 className="font-serif text-sm font-bold text-[#ede8dc]">
                  WinGo 1m Win / Loss Ratio
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {stats1m.winRate}% Accuracy
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData1m}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData1m.map((entry, index) => (
                      <Cell key={`cell-1m-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} stroke="#090b10" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center font-mono text-xs text-[#8c8475]">
              {stats1m.wins} Wins · {stats1m.losses} Losses
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Streak Distribution Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30s Streak Histogram */}
        {(selectedTab === 'COMPARISON' || selectedTab === '30s') && (
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#f5d77f]" />
                <h3 className="font-serif text-sm font-bold text-[#ede8dc]">
                  30-Second Streak Run Distribution
                </h3>
              </div>
              <span className="text-xs text-[#8c8475]">Frequency of Run Lengths</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats30s.streakDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#8c8475" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8c8475" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Streak Count" fill="#d4af37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 1m Streak Histogram */}
        {(selectedTab === 'COMPARISON' || selectedTab === '1m') && (
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-sky-400" />
                <h3 className="font-serif text-sm font-bold text-[#ede8dc]">
                  1-Minute Streak Run Distribution
                </h3>
              </div>
              <span className="text-xs text-[#8c8475]">Frequency of Run Lengths</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats1m.streakDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#8c8475" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8c8475" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Streak Count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Cumulative Performance & Rolling Accuracy */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#ede8dc]">
              Rolling Win Rate Progression (Recent Verified Rounds)
            </h3>
            <p className="text-xs text-[#8c8475]">
              Real-time moving accuracy across past verified API issue numbers
            </p>
          </div>
          <span className="text-xs font-mono text-[#d4af37]">Target: &gt;60% Equilibrium</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedTab === '1m' ? stats1m.cumulativePnl : stats30s.cumulativePnl}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="round" stroke="#8c8475" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#8c8475" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#f5d77f" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '70% Experimental Benchmark', fill: '#f5d77f', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="winRate" name="Rolling Win Rate %" stroke="#f5d77f" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
