// OAuth 2.0 Authorization Code + PKCE flow for Dinero.dk.
// All endpoints are TODO until you have the official Dinero developer docs.
// https://dinero.dk/developers  (TODO: confirm exact URL)

import { generateCodeChallenge, generateCodeVerifier, generateState } from './pkce';
import type { TokenSet } from '@/types/dinero';

// ─── Config ───────────────────────────────────────────────────────────────────

function getConfig() {
  const clientId     = process.env.DINERO_CLIENT_ID;
  const clientSecret = process.env.DINERO_CLIENT_SECRET;
  const redirectUri  = process.env.DINERO_REDIRECT_URI;
  // TODO: confirm exact OAuth endpoint URLs from Dinero docs
  const authBase     = process.env.DINERO_AUTH_BASE_URL ?? 'https://authz.dinero.dk';

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required env vars: DINERO_CLIENT_ID, DINERO_CLIENT_SECRET, DINERO_REDIRECT_URI'
    );
  }
  return { clientId, clientSecret, redirectUri, authBase };
}

// TODO: confirm exact paths from Dinero OAuth docs
const PATHS = {
  authorize: '/connect/authorize', // TODO: confirm
  token:     '/connect/token',     // TODO: confirm
  revoke:    '/connect/revoke',    // TODO: confirm
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthorizationResult {
  url:      string;
  verifier: string;
  state:    string;
}

// Raw token response from Dinero's token endpoint
interface RawTokenResponse {
  access_token:  string;
  refresh_token: string;
  expires_in:    number; // seconds
  token_type:    string;
  scope?:        string;
}

// ─── OAuthService ─────────────────────────────────────────────────────────────

export const OAuthService = {
  /**
   * Build the authorization URL and return it along with the PKCE verifier
   * and state (both must be stored in short-lived cookies before redirecting).
   */
  async buildAuthorizationURL(): Promise<AuthorizationResult> {
    const { clientId, redirectUri, authBase } = getConfig();
    const verifier   = await generateCodeVerifier();
    const challenge  = await generateCodeChallenge(verifier);
    const state      = generateState();

    const params = new URLSearchParams({
      response_type:         'code',
      client_id:             clientId,
      redirect_uri:          redirectUri,
      scope:                 'openid offline_access read write', // TODO: confirm exact Dinero scopes
      code_challenge:        challenge,
      code_challenge_method: 'S256',
      state,
    });

    return {
      url:      `${authBase}${PATHS.authorize}?${params.toString()}`,
      verifier,
      state,
    };
  },

  /**
   * Exchange the authorization code for tokens.
   * Call this from the callback route handler.
   */
  async exchangeCode(code: string, verifier: string): Promise<TokenSet> {
    const { clientId, clientSecret, redirectUri, authBase } = getConfig();

    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      code,
      code_verifier: verifier,
    });

    return OAuthService._postToken(authBase, body);
  },

  /**
   * Use a refresh_token to obtain a new access_token.
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    const { clientId, clientSecret, authBase } = getConfig();

    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    return OAuthService._postToken(authBase, body);
  },

  /**
   * Revoke a refresh token on logout.
   */
  async revokeToken(token: string): Promise<void> {
    const { clientId, clientSecret, authBase } = getConfig();

    const body = new URLSearchParams({
      token,
      client_id:     clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(`${authBase}${PATHS.revoke}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    // Revocation is best-effort — don't throw on errors
    if (!res.ok) {
      console.warn('[OAuthService] Revoke failed:', res.status);
    }
  },

  // ─── Internal ───────────────────────────────────────────────────────────────

  async _postToken(authBase: string, body: URLSearchParams): Promise<TokenSet> {
    let res: Response;
    try {
      res = await fetch(`${authBase}${PATHS.token}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
      });
    } catch (cause) {
      throw new Error(`[OAuthService] Network error reaching token endpoint: ${cause}`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`[OAuthService] Token endpoint returned ${res.status}: ${text}`);
    }

    let raw: RawTokenResponse;
    try {
      raw = await res.json() as RawTokenResponse;
    } catch (cause) {
      throw new Error(`[OAuthService] Failed to parse token response: ${cause}`);
    }

    return {
      accessToken:  raw.access_token,
      refreshToken: raw.refresh_token,
      expiresAt:    Date.now() + raw.expires_in * 1_000,
      tokenType:    raw.token_type,
      scope:        raw.scope,
    };
  },
} as const;
