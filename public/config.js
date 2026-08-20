/**
 * FreedomOps Runtime Configuration
 *
 * This file is served as a STATIC ASSET and is NOT bundled by Vite.
 * This means you can update the API URL on the live Vercel deployment
 * WITHOUT triggering a full rebuild.
 *
 * HOW TO UPDATE THE TUNNEL URL:
 * 1. Edit VITE_API_BASE_URL in Vercel Project Settings → Environment Variables
 * 2. Trigger a new deployment (push a commit or click "Redeploy")
 *    OR
 * 1. Edit the window.__FREEDOMOPS_CONFIG__.apiBase value below
 * 2. Commit and push (Vercel auto-deploys, no npm rebuild needed since this
 *    file is in /public and served verbatim)
 *
 * CURRENT BACKEND:
 * Update the URL below to match your active Cloudflare tunnel.
 */
window.__FREEDOMOPS_CONFIG__ = {
  // Active Cloudflare Quick Tunnel — update this when the tunnel URL changes.
  apiBase: 'https://platform-behalf-forward-eden.trycloudflare.com',
};
