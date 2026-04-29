// PKCE utilities using Web Crypto API — no external dependencies.
// Works in both Node.js 18+ (crypto.subtle available globally) and browsers.

function base64urlEncode(buffer: Uint8Array): string {
  const bytes = Array.from(buffer);
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Generate a cryptographically random code_verifier (43–128 chars, RFC 7636). */
export async function generateCodeVerifier(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return base64urlEncode(buffer);
}

/** Derive code_challenge = BASE64URL(SHA-256(ASCII(code_verifier))). */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(new Uint8Array(hash));
}

/** Generate a random state parameter for CSRF protection. */
export function generateState(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return base64urlEncode(buffer);
}
