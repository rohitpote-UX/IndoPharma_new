/**
 * ==============================================================================
 * INDOPHARM — MOCK PAYMENT ADAPTER (WEBHOOK MODULE)
 * ==============================================================================
 * Handles webhook signature verification and event normalization for the
 * mock development provider.
 *
 * SECURITY: This module must ONLY be active in development/sandbox environments.
 * The MockPaymentAdapter will throw at construction time if NODE_ENV=production.
 * ==============================================================================
 */

import { createHmac } from 'crypto';

/**
 * Computes the expected HMAC-SHA256 signature for a mock webhook payload.
 * Mirrors the signing logic the MockPaymentAdapter uses when generating
 * simulated webhook events.
 */
export function computeMockWebhookSignature(rawBody: string | Buffer, secret: string): string {
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  return createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Verifies a mock webhook signature.
 * In development: uses PAYMENT_WEBHOOK_SECRET env var.
 * Header: x-mock-signature
 */
export function verifyMockWebhookSignature(
  rawBody: string | Buffer,
  headers: Record<string, string>
): { valid: boolean; error?: string } {
  const secret = process.env.PAYMENT_PROVIDER_MOCK_WEBHOOK_SECRET
    || process.env.PAYMENT_WEBHOOK_SECRET
    || '';

  const receivedSignature = headers['x-mock-signature'] || '';

  if (!secret) {
    // In development without a configured secret, accept all (for ease of local dev)
    if (process.env.NODE_ENV === 'development') {
      return { valid: true };
    }
    return { valid: false, error: 'Mock webhook secret not configured' };
  }

  if (!receivedSignature) {
    return { valid: false, error: 'Missing x-mock-signature header' };
  }

  const expectedSignature = computeMockWebhookSignature(rawBody, secret);

  // Constant-time comparison to prevent timing attacks
  if (receivedSignature.length !== expectedSignature.length) {
    return { valid: false, error: 'Signature length mismatch' };
  }

  let mismatch = 0;
  for (let i = 0; i < receivedSignature.length; i++) {
    mismatch |= receivedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, error: 'Signature verification failed' };
  }

  return { valid: true };
}

/**
 * Computes SHA-256 hash of raw payload (for storage/deduplication).
 * This is NOT a secret — it's used as a fingerprint for the raw bytes.
 */
export function computePayloadHash(rawBody: string | Buffer): string {
  const { createHash } = require('crypto') as typeof import('crypto');
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  return createHash('sha256').update(body).digest('hex');
}
