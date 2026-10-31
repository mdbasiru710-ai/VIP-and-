/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, WingoApiSyncResponse, WingoApiConfig } from '../types';

export class WingoApiService {
  /**
   * Fetches the exact server-authoritative Wingo state.
   * STRICT: Never calculates or generates issue numbers locally.
   */
  async fetchLiveSync(
    game: GameMode,
    config?: WingoApiConfig
  ): Promise<WingoApiSyncResponse> {
    const params = new URLSearchParams();
    params.set('game', game);

    if (config?.useCustomUpstream && config.externalUrl) {
      params.set('externalUrl', config.externalUrl);
      if (config.authToken) {
        params.set('authToken', config.authToken);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`/api/wingo/sync?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson?.message) errMessage = errJson.message;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      const data: WingoApiSyncResponse = await response.json();

      if (!data || !data.success) {
        throw new Error(data?.message || 'Invalid API data payload received.');
      }

      if (!data.currentIssueNumber || typeof data.currentIssueNumber !== 'string') {
        throw new Error('API issue number missing or invalid format.');
      }

      // Verify game mode segregation
      if (data.game !== game) {
        throw new Error(`Game mode mismatch: requested ${game} but received ${data.game}.`);
      }

      return data;
    } catch (err: unknown) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : 'Network error or connection timeout.';
      throw new Error(msg);
    }
  }

  /**
   * Tests an external Wingo API URL
   */
  async testEndpoint(url: string, token: string): Promise<{ success: boolean; latencyMs: number; message: string; sample?: unknown }> {
    try {
      const res = await fetch('/api/wingo/test-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token })
      });
      return await res.json();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      return { success: false, latencyMs: 0, message: msg };
    }
  }
}

export const wingoApi = new WingoApiService();
