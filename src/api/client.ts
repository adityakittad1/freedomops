/**
 * FreedomOps API Client
 *
 * This is the ONLY file that directly makes HTTP requests.
 * When VITE_USE_MOCK_API=true, all requests are intercepted before fetch.
 * When VITE_USE_MOCK_API=false, requests go to the real FastAPI backend.
 *
 * ─── INTEGRATION NOTE ─────────────────────────────────────────────────────────
 * To connect the real FastAPI backend, set VITE_USE_MOCK_API=false in .env.
 * The primary endpoint is: POST http://localhost:8000/api/chat
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

/** Simulate network latency in mock mode */
export function mockDelay(ms = 600): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
