/**
 * Connection status hook — tracks whether the FreedomOps backend is reachable.
 *
 * In mock mode: always returns a stable "connected" state (mock doesn't need a backend).
 * In real mode: probes the backend health endpoint on mount and on manual refresh.
 *
 * ─── INTEGRATION NOTE ─────────────────────────────────────────────────────────
 * When Sakshi's FastAPI backend adds GET /health, update `HEALTH_ENDPOINT` and
 * remove the `USE_MOCK` short-circuit below. The endpoint should return:
 *   { status: "ok", ollama: boolean, model: string }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { USE_MOCK, API_BASE } from '../api/client';

export type ConnectionState = 'connected' | 'connecting' | 'offline' | 'error';

export interface SystemConnectionStatus {
  backend: ConnectionState;
  ollama: ConnectionState;
  lastChecked: number | null;
  refresh: () => void;
}

const HEALTH_ENDPOINT = `${API_BASE}/health`;

export function useConnectionStatus(): SystemConnectionStatus {
  const [backend, setBackend] = useState<ConnectionState>('connecting');
  const [ollama, setOllama] = useState<ConnectionState>('connecting');
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  const check = useCallback(async () => {
    if (USE_MOCK) {
      // Mock mode: simulate a healthy connection without making real network requests
      setBackend('connected');
      setOllama('connected');
      setLastChecked(Date.now());
      return;
    }

    // Real mode: probe the backend
    setBackend('connecting');
    setOllama('connecting');
    try {
      const res = await fetch(HEALTH_ENDPOINT, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setBackend('connected');
        // If backend reports ollama status, use it; otherwise assume connected
        setOllama(data?.ollama === false ? 'offline' : 'connected');
      } else {
        setBackend('error');
        setOllama('error');
      }
    } catch {
      setBackend('offline');
      setOllama('offline');
    } finally {
      setLastChecked(Date.now());
    }
  }, []);

  useEffect(() => {
    check();
    // Re-check every 30 seconds in real mode
    if (!USE_MOCK) {
      const interval = setInterval(check, 30_000);
      return () => clearInterval(interval);
    }
  }, [check]);

  return { backend, ollama, lastChecked, refresh: check };
}
