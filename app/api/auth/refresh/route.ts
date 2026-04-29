import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/lib/auth/oauth';
import { TokenStore } from '@/lib/storage/token-store';
import {
  REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS, REFRESH_TOKEN_MAX_AGE,
} from '@/lib/storage/token-store';

// POST /api/auth/refresh
// Called server-side (or by the DineroAPIClient auto-refresh hook) to get a new access token.
// The refresh token is read exclusively from the HttpOnly cookie.
export async function POST(req: NextRequest) {
  const rt = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!rt) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  let tokens: Awaited<ReturnType<typeof OAuthService.refreshAccessToken>>;
  try {
    tokens = await OAuthService.refreshAccessToken(rt);
  } catch (err) {
    console.error('[/api/auth/refresh]', err);
    // Refresh token is invalid or expired — force re-login
    const res = NextResponse.json({ error: 'Refresh failed — please log in again' }, { status: 401 });
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    TokenStore.clear();
    return res;
  }

  TokenStore.set(tokens);

  const res = NextResponse.json({ ok: true, expiresAt: tokens.expiresAt });

  // Rotate the refresh token cookie if Dinero issues a new one
  res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return res;
}
