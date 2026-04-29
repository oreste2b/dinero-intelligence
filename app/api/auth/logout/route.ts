import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/lib/auth/oauth';
import { TokenStore } from '@/lib/storage/token-store';
import { REFRESH_TOKEN_COOKIE } from '@/lib/storage/token-store';

// POST /api/auth/logout
// Revokes the refresh token at Dinero, clears cookies, and wipes in-memory state.
export async function POST(req: NextRequest) {
  const rt = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (rt) {
    // Best-effort revocation — don't block logout if it fails
    await OAuthService.revokeToken(rt).catch(err =>
      console.warn('[/api/auth/logout] revoke error:', err)
    );
  }

  TokenStore.clear();

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_TOKEN_COOKIE);

  return res;
}
