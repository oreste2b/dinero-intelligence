// Token persistence strategy:
//   access_token  — in-memory only (never persisted to disk/cookie).
//   refresh_token — HttpOnly + Secure + SameSite=Lax cookie (server-side set/read only).
//
// This module manages the in-memory access token for the client side.
// The refresh token is managed exclusively by Next.js Route Handlers (server-side).

import type { TokenSet } from '@/types/dinero';

const REFRESH_MARGIN_MS = 60 * 1_000; // refresh 60s before expiry

// ─── In-memory store (module-level singleton) ─────────────────────────────────
// In Next.js App Router, this module is loaded once per server process.
// For edge deployments or multiple replicas, replace with a shared store (Redis, etc.).

let _tokenSet: TokenSet | null = null;

export const TokenStore = {
  set(tokens: TokenSet): void {
    _tokenSet = tokens;
  },

  get(): TokenSet | null {
    return _tokenSet;
  },

  clear(): void {
    _tokenSet = null;
  },

  /** Returns the access token if present and not close to expiry. */
  getValidAccessToken(): string | null {
    if (!_tokenSet) return null;
    if (Date.now() >= _tokenSet.expiresAt - REFRESH_MARGIN_MS) return null;
    return _tokenSet.accessToken;
  },

  isExpiredOrMissing(): boolean {
    if (!_tokenSet) return true;
    return Date.now() >= _tokenSet.expiresAt - REFRESH_MARGIN_MS;
  },
} as const;

// ─── Cookie helpers (server-side only) ───────────────────────────────────────

export const REFRESH_TOKEN_COOKIE = 'dinero_rt';
export const VERIFIER_COOKIE      = 'dinero_pkce_v';
export const STATE_COOKIE         = 'dinero_state';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const;

export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
export const SHORT_COOKIE_MAX_AGE  = 60 * 10;            // 10 min for PKCE verifier
