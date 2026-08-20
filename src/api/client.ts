/**
 * FreedomOps API Client
 *
 * This is the ONLY file that directly makes HTTP requests.
 * When VITE_USE_MOCK_API=true, all requests are intercepted before fetch.
 * When VITE_USE_MOCK_API=false, requests go to the real FastAPI backend.
 *
 * ─── HOW THE API BASE URL IS RESOLVED (in order of priority) ──────────────────
 *
 * 1. window.__FREEDOMOPS_CONFIG__.apiBase  (runtime — public/config.js)
 *    → Served as a static file, NOT bundled. Update without rebuilding.
 *    → Highest priority. Used in production when the file is present.
 *
 * 2. import.meta.env.VITE_API_BASE_URL     (build-time — Vercel env var)
 *    → Set in Vercel Project Settings → Environment Variables.
 *    → Baked into the JS bundle at build time. Requires a redeploy to change.
 *
 * 3. '' (empty string)                     (dev — Vite proxy)
 *    → Falls through to the Vite dev proxy defined in vite.config.ts,
 *      which forwards /api/* → http://localhost:8000/api/*
 *
 * ─── INTEGRATION NOTE ─────────────────────────────────────────────────────────
 * To connect the real FastAPI backend, set VITE_USE_MOCK_API=false in .env.
 * Set VITE_API_BASE_URL to your Cloudflare tunnel URL in Vercel env vars.
 * ─────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    __FREEDOMOPS_CONFIG__?: {
      apiBase?: string;
    };
  }
}

export const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * Resolve the API base URL at runtime.
 * Priority: runtime config > build-time env var > '' (Vite proxy / relative)
 */
function resolveApiBase(): string {
  // 1. Runtime config (public/config.js — not bundled, can be updated on Vercel
  //    without a rebuild by editing the file directly in the repo and pushing)
  const runtimeBase = window.__FREEDOMOPS_CONFIG__?.apiBase;
  if (runtimeBase && runtimeBase.trim() !== '') {
    return runtimeBase.trim().replace(/\/$/, ''); // strip trailing slash
  }

  // 2. Build-time Vite env var (set in Vercel Project Settings)
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase && envBase.trim() !== '') {
    return envBase.trim().replace(/\/$/, '');
  }

  // 3. Empty string → Vite proxy in dev, or relative URLs in prod
  return '';
}

export const API_BASE = resolveApiBase();


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
