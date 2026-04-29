// Discriminated union of all API error kinds.
// Use `error.kind` to narrow in switch/if statements without instanceof.

export type DineroAPIError =
  | { kind: 'network';      message: string; cause?: unknown }
  | { kind: 'unauthorized'; message: string; }
  | { kind: 'rate_limited'; retryAfter?: number; message: string }
  | { kind: 'server';       statusCode: number; message: string; body?: string }
  | { kind: 'decode';       message: string; cause?: unknown };

export class DineroAPIException extends Error {
  constructor(public readonly error: DineroAPIError) {
    super(error.message);
    this.name = 'DineroAPIException';
  }
}

// Helpers to construct typed errors

export const ApiError = {
  network:     (message: string, cause?: unknown): DineroAPIError =>
    ({ kind: 'network', message, cause }),

  unauthorized: (message = 'Unauthorized — token missing or invalid'): DineroAPIError =>
    ({ kind: 'unauthorized', message }),

  rateLimited:  (retryAfter?: number): DineroAPIError =>
    ({ kind: 'rate_limited', retryAfter, message: `Rate limited${retryAfter ? ` — retry after ${retryAfter}s` : ''}` }),

  server:       (statusCode: number, body?: string): DineroAPIError =>
    ({ kind: 'server', statusCode, message: `HTTP ${statusCode}`, body }),

  decode:       (message: string, cause?: unknown): DineroAPIError =>
    ({ kind: 'decode', message, cause }),
} as const;
