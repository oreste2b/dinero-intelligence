// DineroAPIClient — fetch-based HTTP client with:
//   • Typed error handling (DineroAPIError discriminated union)
//   • Exponential backoff + jitter (3 attempts: 500ms / 1s / 2s base)
//   • Auto-refresh on 401 (single refresh per concurrent burst)
//   • Bearer token injection via injected getter/refresher

import { ApiError, DineroAPIException } from './errors';
import type { DineroAPIError } from './errors';

// ─── Config ───────────────────────────────────────────────────────────────────

// TODO: confirm exact base URL and versioning scheme from Dinero API docs
const DEFAULT_BASE_URL = process.env.DINERO_API_BASE_URL ?? 'https://api.dinero.dk/v1';

const MAX_RETRIES   = 3;
const BASE_DELAYS   = [500, 1_000, 2_000] as const; // ms
const MAX_JITTER_MS = 150;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DineroClientOptions {
  baseURL?:       string;
  /** Return the current in-memory access token (null if not authenticated). */
  getAccessToken: () => string | null;
  /** Called when a 401 is received — should refresh and return the new token. */
  refreshToken:   () => Promise<string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(): number {
  return Math.random() * MAX_JITTER_MS;
}

function retryDelay(attempt: number): number {
  return BASE_DELAYS[Math.min(attempt, BASE_DELAYS.length - 1)] + jitter();
}

function isRetryable(statusCode: number): boolean {
  // Retry on 429 (rate limit) and 5xx (server errors). Never retry 4xx except 429.
  return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
}

// ─── DineroAPIClient ──────────────────────────────────────────────────────────

export class DineroAPIClient {
  private readonly baseURL: string;
  private readonly getAccessToken: () => string | null;
  private readonly doRefreshToken: () => Promise<string>;

  // Guard against multiple concurrent refresh calls
  private refreshPromise: Promise<string> | null = null;

  constructor(options: DineroClientOptions) {
    this.baseURL         = options.baseURL ?? DEFAULT_BASE_URL;
    this.getAccessToken  = options.getAccessToken;
    this.doRefreshToken  = options.refreshToken;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  async get<T>(path: string, init?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...init, method: 'GET' });
  }

  async post<T>(path: string, body: unknown, init?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body:   JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  }

  async put<T>(path: string, body: unknown, init?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, {
      ...init,
      method: 'PUT',
      body:   JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  }

  async delete<T = void>(path: string, init?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(path, { ...init, method: 'DELETE' });
  }

  // ─── Core request with retry + refresh ──────────────────────────────────────

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let lastError: DineroAPIError | null = null;
    let didRefresh = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const token = this.getAccessToken();
      if (!token) {
        // No token — try to refresh once before the first attempt
        if (!didRefresh) {
          await this._ensureRefreshed();
          didRefresh = true;
          // Re-run the same attempt index after refreshing
          continue;
        }
        throw new DineroAPIException(ApiError.unauthorized());
      }

      const url = `${this.baseURL}${path}`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Accept':        'application/json',
        ...(init.headers as Record<string, string> ?? {}),
      };

      let res: Response;
      try {
        res = await fetch(url, { ...init, headers });
      } catch (cause) {
        // Network-level error (DNS failure, timeout, etc.)
        lastError = ApiError.network(
          `Network error fetching ${init.method ?? 'GET'} ${path}: ${cause}`,
          cause
        );
        if (attempt < MAX_RETRIES - 1) {
          await sleep(retryDelay(attempt));
          continue;
        }
        throw new DineroAPIException(lastError);
      }

      // ── 401: try a single token refresh then retry ─────────────────────────
      if (res.status === 401 && !didRefresh) {
        didRefresh = true;
        try {
          await this._ensureRefreshed();
        } catch {
          throw new DineroAPIException(ApiError.unauthorized());
        }
        // Re-run same attempt with fresh token
        continue;
      }

      // ── 429: rate limited — backoff then retry ─────────────────────────────
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? 0);
        lastError = ApiError.rateLimited(retryAfter || undefined);
        if (attempt < MAX_RETRIES - 1) {
          await sleep(retryAfter ? retryAfter * 1_000 : retryDelay(attempt));
          continue;
        }
        throw new DineroAPIException(lastError);
      }

      // ── 5xx: server error — backoff then retry ─────────────────────────────
      if (isRetryable(res.status) && res.status !== 429) {
        const body = await res.text().catch(() => '');
        lastError = ApiError.server(res.status, body);
        if (attempt < MAX_RETRIES - 1) {
          await sleep(retryDelay(attempt));
          continue;
        }
        throw new DineroAPIException(lastError);
      }

      // ── Non-retryable 4xx ─────────────────────────────────────────────────
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new DineroAPIException(ApiError.server(res.status, body));
      }

      // ── Success: parse JSON ───────────────────────────────────────────────
      if (res.status === 204) return undefined as T; // No Content

      try {
        return (await res.json()) as T;
      } catch (cause) {
        throw new DineroAPIException(
          ApiError.decode(`Failed to parse JSON response from ${path}`, cause)
        );
      }
    }

    // Should not reach here, but safety net
    throw new DineroAPIException(lastError ?? ApiError.network(`Max retries exceeded for ${path}`));
  }

  // ─── Refresh guard ───────────────────────────────────────────────────────────

  private async _ensureRefreshed(): Promise<string> {
    // Coalesce concurrent refresh calls into one
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefreshToken().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────
// Import `dineroClient` in server actions / route handlers.
// The TokenStore is server-side only — do not import in Client Components.

import { TokenStore } from '@/lib/storage/token-store';
import { OAuthService } from '@/lib/auth/oauth';
import { cookies } from 'next/headers';
import { REFRESH_TOKEN_COOKIE } from '@/lib/storage/token-store';

async function serverRefreshToken(): Promise<string> {
  const cookieStore = cookies();
  const rt = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!rt) throw new Error('No refresh token cookie');

  const tokens = await OAuthService.refreshAccessToken(rt);
  TokenStore.set(tokens);
  return tokens.accessToken;
}

export function createDineroClient(baseURL?: string): DineroAPIClient {
  return new DineroAPIClient({
    baseURL,
    getAccessToken: () => TokenStore.getValidAccessToken(),
    refreshToken:   serverRefreshToken,
  });
}

// Lazy singleton — re-created per request in serverless environments
let _client: DineroAPIClient | null = null;
export function getDineroClient(): DineroAPIClient {
  if (!_client) _client = createDineroClient();
  return _client;
}
