/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SettledDraw {
  issueNumber: string;
  number: number;
  outcome: 'BIG' | 'SMALL';
  color: 'RED' | 'GREEN' | 'VIOLET' | 'RED_VIOLET' | 'GREEN_VIOLET';
  settledAt: number;
}

// Server-authoritative state for both WinGo modes
class WingoServerEngine {
  private history30s: SettledDraw[] = [];
  private history1m: SettledDraw[] = [];
  private lastResolved30sPeriod = '';
  private lastResolved1mPeriod = '';

  constructor() {
    this.seedHistory();
  }

  private getDayDateString(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  // Pre-seed realistic settled history matching the exact issue numbering structure (up to 500 draws)
  private seedHistory() {
    const now = Date.now();
    const dateStr = this.getDayDateString();

    // 30s game (cycle = 30 seconds, 2880 draws per day)
    const currentSeq30s = Math.floor((now % 86400000) / 30000) + 1;
    for (let i = 500; i >= 1; i--) {
      const seq = Math.max(1, currentSeq30s - i);
      const issueNumber = `${dateStr}10005${String(seq).padStart(4, '0')}`;
      const num = Math.floor((Math.sin(seq * 9301 + 49297) * 0.5 + 0.5) * 10);
      const outcome = num >= 5 ? 'BIG' : 'SMALL';
      const color = num === 0 ? 'RED_VIOLET' : num === 5 ? 'GREEN_VIOLET' : [1, 3, 7, 9].includes(num) ? 'GREEN' : 'RED';
      this.history30s.push({
        issueNumber,
        number: num,
        outcome,
        color,
        settledAt: now - i * 30000
      });
    }

    // 1m game (cycle = 60 seconds, 1440 draws per day)
    const currentSeq1m = Math.floor((now % 86400000) / 60000) + 1;
    for (let i = 500; i >= 1; i--) {
      const seq = Math.max(1, currentSeq1m - i);
      const issueNumber = `${dateStr}10001${String(seq).padStart(4, '0')}`;
      const num = Math.floor((Math.cos(seq * 49297 + 9301) * 0.5 + 0.5) * 10);
      const outcome = num >= 5 ? 'BIG' : 'SMALL';
      const color = num === 0 ? 'RED_VIOLET' : num === 5 ? 'GREEN_VIOLET' : [1, 3, 7, 9].includes(num) ? 'GREEN' : 'RED';
      this.history1m.push({
        issueNumber,
        number: num,
        outcome,
        color,
        settledAt: now - i * 60000
      });
    }
  }

  // Authoritative draw calculation on round boundary
  public syncState(game: '30s' | '1m') {
    const now = Date.now();
    const cycleMs = game === '30s' ? 30000 : 60000;
    const cycleSec = game === '30s' ? 30 : 60;
    const gameCode = game === '30s' ? '10005' : '10001';

    const msIntoDay = now % 86400000;
    const currentSeq = Math.floor(msIntoDay / cycleMs) + 1;
    const dateStr = this.getDayDateString();

    const currentIssueNumber = `${dateStr}${gameCode}${String(currentSeq).padStart(4, '0')}`;
    const previousIssueNumber = `${dateStr}${gameCode}${String(currentSeq - 1).padStart(4, '0')}`;

    const msIntoCurrentCycle = msIntoDay % cycleMs;
    const remainingMs = cycleMs - msIntoCurrentCycle;
    const serverRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const isLocked = serverRemainingSeconds <= 5;

    const history = game === '30s' ? this.history30s : this.history1m;
    const lastResolvedPeriod = game === '30s' ? this.lastResolved30sPeriod : this.lastResolved1mPeriod;

    // Check if previous period has settled and needs to be added to history
    if (previousIssueNumber && previousIssueNumber !== lastResolvedPeriod) {
      // Settle the previous round
      const exists = history.some(h => h.issueNumber === previousIssueNumber);
      if (!exists) {
        // Deterministic server RNG from period seed
        const seed = parseInt(previousIssueNumber.slice(-6), 10) || 123456;
        const num = Math.floor(((Math.sin(seed * 7823) + 1) * 0.5) * 10);
        const outcome = num >= 5 ? 'BIG' : 'SMALL';
        const color = num === 0 ? 'RED_VIOLET' : num === 5 ? 'GREEN_VIOLET' : [1, 3, 7, 9].includes(num) ? 'GREEN' : 'RED';

        const settled: SettledDraw = {
          issueNumber: previousIssueNumber,
          number: num,
          outcome,
          color,
          settledAt: now - msIntoCurrentCycle
        };

        history.unshift(settled);
        if (history.length > 600) history.pop();

        if (game === '30s') {
          this.lastResolved30sPeriod = previousIssueNumber;
        } else {
          this.lastResolved1mPeriod = previousIssueNumber;
        }
      }
    }

    const latestSettled = history[0] || null;

    return {
      success: true,
      game,
      currentIssueNumber,
      serverRemainingSeconds,
      serverTimestamp: now,
      cycleSeconds: cycleSec,
      isLocked,
      latestSettledRound: latestSettled,
      history: history.slice(0, 500),
      source: 'AUTHORIZED_WINGO_API'
    };
  }
}

const wingoEngine = new WingoServerEngine();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Authorized Wingo Synchronization API endpoint
  app.get('/api/wingo/sync', async (req: Request, res: Response) => {
    const game = req.query.game === '1m' ? '1m' : '30s';
    const externalUrl = req.query.externalUrl as string;
    const authToken = req.query.authToken as string;

    // If user configured a specific external Wingo server endpoint, proxy to it
    if (externalUrl && externalUrl.startsWith('http')) {
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'User-Agent': 'AuraVipSyncEngine/3.8'
        };
        if (authToken) {
          headers['Authorization'] = authToken.startsWith('Bearer') ? authToken : `Bearer ${authToken}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const upstreamRes = await fetch(externalUrl, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!upstreamRes.ok) {
          return res.status(502).json({
            success: false,
            error: 'UPSTREAM_API_ERROR',
            message: `External Wingo server responded with HTTP ${upstreamRes.status} ${upstreamRes.statusText}`
          });
        }

        const json = await upstreamRes.json();
        
        // Extract fields according to standard WinGo API payload structures
        const currentIssue = json?.data?.issueNumber || json?.issueNumber || json?.data?.issue || json?.currentIssue;
        const remainTime = json?.data?.remainTime ?? json?.remainTime ?? json?.data?.countdown ?? 30;
        const rawList = json?.data?.list || json?.list || [];

        if (!currentIssue) {
          return res.status(502).json({
            success: false,
            error: 'INVALID_ISSUE_STRUCTURE',
            message: 'External API returned response but issueNumber field was missing.'
          });
        }

        const formattedHistory: SettledDraw[] = rawList.slice(0, 30).map((item: any) => {
          const num = typeof item.number === 'number' ? item.number : parseInt(item.number || '0', 10);
          const outcome = num >= 5 ? 'BIG' : 'SMALL';
          const color = num === 0 ? 'RED_VIOLET' : num === 5 ? 'GREEN_VIOLET' : [1, 3, 7, 9].includes(num) ? 'GREEN' : 'RED';
          return {
            issueNumber: String(item.issueNumber || item.issue || ''),
            number: num,
            outcome,
            color,
            settledAt: item.timestamp || Date.now()
          };
        });

        return res.json({
          success: true,
          game,
          currentIssueNumber: String(currentIssue),
          serverRemainingSeconds: Math.max(0, parseInt(remainTime, 10) || 0),
          serverTimestamp: Date.now(),
          cycleSeconds: game === '30s' ? 30 : 60,
          isLocked: (parseInt(remainTime, 10) || 0) <= 5,
          latestSettledRound: formattedHistory[0] || null,
          history: formattedHistory,
          source: 'EXTERNAL_AUTHORIZED_WINGO_API'
        });
      } catch (err: any) {
        return res.status(502).json({
          success: false,
          error: 'UPSTREAM_API_UNREACHABLE',
          message: `Failed to reach external Wingo server: ${err?.message || 'Network timeout / unreachable'}`
        });
      }
    }

    // Default: Synchronized Server-Authoritative Engine
    const state = wingoEngine.syncState(game);
    return res.json(state);
  });

  // Test external endpoint utility
  app.post('/api/wingo/test-endpoint', async (req: Request, res: Response) => {
    const { url, token } = req.body;
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, message: 'Valid HTTP/HTTPS URL required' });
    }

    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer') ? token : `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const upstream = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!upstream.ok) {
        return res.status(upstream.status).json({
          success: false,
          latencyMs,
          message: `Server returned HTTP ${upstream.status} ${upstream.statusText}`
        });
      }

      const data = await upstream.json();
      return res.json({
        success: true,
        latencyMs,
        message: `Authorized connection verified (${latencyMs}ms)`,
        sample: data
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return res.status(502).json({
        success: false,
        latencyMs,
        message: `Connection failed: ${err.message}`
      });
    }
  });

  // Mount Vite in dev mode
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURA VIP WinGo Predictor server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
