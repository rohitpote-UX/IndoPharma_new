/**
 * ==============================================================================
 * INDOPHARM — CSRF & ORIGIN INTEGRITY DEFENSES
 * ==============================================================================
 * Validates Origin and Referer headers for state-changing HTTP methods
 * (POST, PUT, PATCH, DELETE) when using cookie-based authentication.
 * Webhook endpoints verify cryptographic signatures and are exempt from browser CSRF.
 * ==============================================================================
 */

import { NextRequest } from 'next/server';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Validates that an incoming state-changing request originates from an allowed domain.
 */
export function validateCsrfOrigin(req: NextRequest | Request | { method: string; headers: Headers; url?: string; nextUrl?: { pathname: string } }): boolean {
  // Safe methods (GET, HEAD, OPTIONS) do not require CSRF validation
  if (!STATE_CHANGING_METHODS.has(req.method.toUpperCase())) {
    return true;
  }

  // Webhook endpoints authenticate via HMAC-SHA256 signatures, not cookies
  const nextUrl = 'nextUrl' in req ? (req as any).nextUrl : undefined;
  const pathname = nextUrl?.pathname || (req.url ? new URL(req.url, 'http://localhost').pathname : '');
  if (pathname.startsWith('/api/payments/webhooks/')) {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // Allow custom header tokens commonly sent by SPA fetch / API clients
  const customHeader = req.headers.get('x-requested-with');
  if (customHeader === 'XMLHttpRequest') {
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let allowedHost: string;
  try {
    allowedHost = new URL(appUrl).host;
  } catch {
    allowedHost = 'localhost:3000';
  }

  const hostHeader = req.headers.get('host');

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return (
        originHost === hostHeader ||
        originHost === allowedHost ||
        originHost === 'localhost:3000' ||
        originHost === '127.0.0.1:3000'
      );
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return (
        refererHost === hostHeader ||
        refererHost === allowedHost ||
        refererHost === 'localhost:3000' ||
        refererHost === '127.0.0.1:3000'
      );
    } catch {
      return false;
    }
  }

  // If both origin and referer are missing in a browser-targeted state-changing request,
  // reject to fail-closed against CSRF attacks.
  return false;
}
