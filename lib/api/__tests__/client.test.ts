// Unit tests for DineroAPIClient.
// All tests use vi.fn() to mock global fetch — no real network calls.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DineroAPIClient } from '../client';
import type { DineroClientOptions } from '../client';
import { DineroAPIException } from '../errors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function makeClient(overrides: Partial<DineroClientOptions> = {}): DineroAPIClient {
  return new DineroAPIClient({
    baseURL:        'https://api.test',
    getAccessToken: () => 'tok_valid',
    refreshToken:   vi.fn().mockResolvedValue('tok_refreshed'),
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DineroAPIClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Success ──────────────────────────────────────────────────────────────────

  it('returns parsed JSON on 200', async () => {
    const payload = { id: 1, name: 'ACME ApS' };
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(200, payload));

    const client = makeClient();
    const result = await client.get<typeof payload>('/organizations/1');

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.test/organizations/1',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok_valid' }),
      })
    );
  });

  it('returns undefined on 204 No Content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = makeClient();
    const result = await client.delete('/organizations/1/invoices/5');

    expect(result).toBeUndefined();
  });

  // ── 401 + refresh + retry ─────────────────────────────────────────────────

  it('retries once with a fresh token after 401', async () => {
    const payload = { id: 42 };
    // Simulate the real behaviour: refreshToken updates the in-memory store,
    // so getAccessToken returns the new token on the next attempt.
    let currentToken = 'tok_valid';
    const refreshFn = vi.fn().mockImplementation(async () => {
      currentToken = 'tok_refreshed';
      return currentToken;
    });

    vi.mocked(fetch)
      .mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }))
      .mockResolvedValueOnce(makeResponse(200, payload));

    const client = makeClient({
      getAccessToken: () => currentToken,
      refreshToken: refreshFn,
    });
    const result = await client.get<typeof payload>('/contacts/42');

    expect(refreshFn).toHaveBeenCalledOnce();
    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledTimes(2);

    // Second call must use the refreshed token
    const [, secondCall] = vi.mocked(fetch).mock.calls;
    expect((secondCall[1] as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer tok_refreshed',
    });
  });

  it('throws unauthorized if refresh also fails', async () => {
    const refreshFn = vi.fn().mockRejectedValue(new Error('refresh failed'));

    vi.mocked(fetch).mockResolvedValue(makeResponse(401, { error: 'unauthorized' }));

    const client = makeClient({ refreshToken: refreshFn });

    await expect(client.get('/protected')).rejects.toBeInstanceOf(DineroAPIException);

    const err = await client.get('/protected').catch(e => e) as DineroAPIException;
    expect(err.error.kind).toBe('unauthorized');
  });

  // ── 429 rate limit with backoff ───────────────────────────────────────────

  it('retries on 429 and succeeds on subsequent attempt', async () => {
    const payload = { data: 'ok' };

    vi.mocked(fetch)
      .mockResolvedValueOnce(makeResponse(429, 'rate limited', { 'Retry-After': '0' }))
      .mockResolvedValueOnce(makeResponse(200, payload));

    // Stub sleep so tests run instantly
    vi.stubGlobal('setTimeout', (fn: () => void) => { fn(); return 0 as unknown as NodeJS.Timeout; });

    const client = makeClient();
    const result = await client.get<typeof payload>('/invoices');

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws rate_limited after exhausting all retries', async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse(429, 'rate limited', { 'Retry-After': '0' }));
    vi.stubGlobal('setTimeout', (fn: () => void) => { fn(); return 0 as unknown as NodeJS.Timeout; });

    const client = makeClient();
    const err = await client.get('/invoices').catch(e => e) as DineroAPIException;

    expect(err).toBeInstanceOf(DineroAPIException);
    expect(err.error.kind).toBe('rate_limited');
    expect(fetch).toHaveBeenCalledTimes(3); // MAX_RETRIES = 3
  });

  // ── Network error ─────────────────────────────────────────────────────────

  it('throws network error on fetch rejection', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('setTimeout', (fn: () => void) => { fn(); return 0 as unknown as NodeJS.Timeout; });

    const client = makeClient();
    const err = await client.get('/organizations').catch(e => e) as DineroAPIException;

    expect(err).toBeInstanceOf(DineroAPIException);
    expect(err.error.kind).toBe('network');
    expect(fetch).toHaveBeenCalledTimes(3); // retried all 3 times
  });

  // ── Decode error ──────────────────────────────────────────────────────────

  it('throws decode error when response is not valid JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('not json at all', { status: 200 }));

    const client = makeClient();
    const err = await client.get('/vouchers').catch(e => e) as DineroAPIException;

    expect(err).toBeInstanceOf(DineroAPIException);
    expect(err.error.kind).toBe('decode');
  });

  // ── Non-retryable 4xx ─────────────────────────────────────────────────────

  it('throws server error immediately on 404 without retrying', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(404, { error: 'not found' }));

    const client = makeClient();
    const err = await client.get('/contacts/99999').catch(e => e) as DineroAPIException;

    expect(err).toBeInstanceOf(DineroAPIException);
    expect(err.error.kind).toBe('server');
    expect((err.error as { statusCode: number }).statusCode).toBe(404);
    expect(fetch).toHaveBeenCalledOnce(); // no retry on 404
  });

  // ── Auth header injection ─────────────────────────────────────────────────

  it('injects Bearer token in every request', async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse(200, {}));

    const client = makeClient({ getAccessToken: () => 'my_special_token' });
    await client.post('/invoices', { title: 'Test' });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my_special_token' }),
      })
    );
  });

  // ── Missing token — attempts refresh before first request ─────────────────

  it('refreshes when getAccessToken returns null, then proceeds', async () => {
    const payload = { id: 1 };
    const refreshFn = vi.fn().mockResolvedValue('tok_from_refresh');
    let callCount = 0;

    vi.mocked(fetch).mockResolvedValue(makeResponse(200, payload));

    const client = makeClient({
      getAccessToken: () => {
        // Return null first time (triggering refresh), then return the refreshed token
        callCount++;
        return callCount === 1 ? null : 'tok_from_refresh';
      },
      refreshToken: refreshFn,
    });

    const result = await client.get<typeof payload>('/organizations/1');

    expect(refreshFn).toHaveBeenCalledOnce();
    expect(result).toEqual(payload);
  });
});
