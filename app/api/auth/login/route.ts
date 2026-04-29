import { NextResponse } from 'next/server';
import { OAuthService } from '@/lib/auth/oauth';
import {
  VERIFIER_COOKIE, STATE_COOKIE,
  COOKIE_OPTIONS, SHORT_COOKIE_MAX_AGE,
} from '@/lib/storage/token-store';

// GET /api/auth/login
// Redirects the user to Dinero's authorization endpoint.
// Stores the PKCE verifier + state in short-lived HttpOnly cookies for the callback.
export async function GET() {
  let auth: Awaited<ReturnType<typeof OAuthService.buildAuthorizationURL>>;

  try {
    auth = await OAuthService.buildAuthorizationURL();
  } catch (err) {
    console.error('[/api/auth/login]', err);
    return NextResponse.json({ error: 'OAuth configuration error' }, { status: 500 });
  }

  const res = NextResponse.redirect(auth.url);

  res.cookies.set(VERIFIER_COOKIE, auth.verifier, {
    ...COOKIE_OPTIONS,
    maxAge: SHORT_COOKIE_MAX_AGE,
  });
  res.cookies.set(STATE_COOKIE, auth.state, {
    ...COOKIE_OPTIONS,
    maxAge: SHORT_COOKIE_MAX_AGE,
  });

  return res;
}
