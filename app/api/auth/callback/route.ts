import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/lib/auth/oauth';
import { TokenStore } from '@/lib/storage/token-store';
import {
  VERIFIER_COOKIE, STATE_COOKIE, REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS, REFRESH_TOKEN_MAX_AGE,
} from '@/lib/storage/token-store';

// GET /api/auth/callback?code=...&state=...
// Exchanges the authorization code for tokens and stores them.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const storedState    = req.cookies.get(STATE_COOKIE)?.value;
  const storedVerifier = req.cookies.get(VERIFIER_COOKIE)?.value;

  if (!storedState || state !== storedState) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }
  if (!storedVerifier) {
    return NextResponse.json({ error: 'Missing PKCE verifier' }, { status: 400 });
  }

  let tokens: Awaited<ReturnType<typeof OAuthService.exchangeCode>>;
  try {
    tokens = await OAuthService.exchangeCode(code, storedVerifier);
  } catch (err) {
    console.error('[/api/auth/callback]', err);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 502 });
  }

  // Store access token in memory
  TokenStore.set(tokens);

  const res = NextResponse.redirect(new URL('/invoice', req.url));

  // Persist refresh token in HttpOnly cookie only
  res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  // Clear PKCE cookies
  res.cookies.delete(VERIFIER_COOKIE);
  res.cookies.delete(STATE_COOKIE);

  return res;
}
