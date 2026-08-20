/**
 * Connection status hook — tracks whether the FreedomOps backend is reachable.
 *
 * In mock mode: always returns a stable "connected" state (mock doesn't need a backend).
 * In real mode: probes GET /api/health on mount and every 30 seconds.
 *
 * Health response shape (from backend/main.py):
 *   { status: "ok", message: string, ollama: boolean, model: string }
 */

import { useState, useEffect, useCallback } from 'react';
import { USE_MOCK, API_BASE } from '../api/client';

export type ConnectionState = 'connected' | 'connecting' | 'offline' | 'error';

export interface SystemConnectionStatus {
  backend: ConnectionState;
  ollama: ConnectionState;
  model: string | null;
  lastChecked: number | null;
  refresh: () => void;
}

const HEALTH_ENDPOINT = `${API_BASE}/api/health`;

export function useConnectionStatus(): SystemConnectionStatus {
  const [backend, setBackend] = useState<ConnectionState>('connecting');
  const [ollama, setOllama] = useState<ConnectionState>('connecting');
  const [model, setModel] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  const check = useCallback(async () => {
    if (USE_MOCK) {
      // Mock mode: simulate a healthy connection without making real network requests
      setBackend('connected');
      setOllama('connected');
      setModel('qwen3');
      setLastChecked(Date.now());
      return;
    }

    // Real mode: probe the backend
    setBackend('connecting');
    setOllama('connecting');
    try {
      const res = await fetch(HEALTH_ENDPOINT, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setBackend('connected');
        // data.ollama: boolean from /api/health
        setOllama(data?.ollama === false ? 'offline' : 'connected');
        // data.model: "qwen3" etc.
        if (data?.model) setModel(data.model as string);
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

  return { backend, ollama, model, lastChecked, refresh: check };
}
