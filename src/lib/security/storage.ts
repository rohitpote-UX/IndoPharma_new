/**
 * ==============================================================================
 * INDOPHARM — SECURE STORAGE & SHORT-LIVED SIGNED URLS
 * ==============================================================================
 * Guarantees private storage for prescription ePHI and clinical documents (Golden Rules 21, 22).
 * Issues and validates short-lived HMAC-SHA256 signed download tokens (15-minute expiration).
 * Enforces strict path traversal defenses.
 * ==============================================================================
 */

import crypto from 'crypto';

const SIGNED_URL_DEFAULT_EXPIRY_SECONDS = 15 * 60; // 15 minutes

function getSigningKey(): string {
  return (
    process.env.STORAGE_SECRET_KEY ||
    process.env.SESSION_SECRET ||
    'dev_signing_key_change_in_production_min_32_chars'
  );
}

export interface SignedUrlParams {
  storageKey: string;
  userId: string;
  expiresAt: number;
  signature: string;
}

/**
 * Validates that a storage key does not contain directory traversal sequences.
 */
export function sanitizeStorageKey(storageKey: string): string {
  if (!storageKey || typeof storageKey !== 'string') {
    throw new Error('Invalid storage key.');
  }

  // Reject path traversal attempts
  if (storageKey.includes('..') || storageKey.includes('\\') || storageKey.startsWith('/')) {
    throw new Error('Path traversal sequence detected in storage key.');
  }

  return storageKey;
}

export const sanitizeStoragePath = sanitizeStorageKey;

/**
 * Generates a short-lived HMAC-SHA256 signed document download URL.
 */
export function createSignedDocumentUrl(
  storageKey: string,
  arg2?: string | { userId?: string; expiresInMinutes?: number; expiresInSeconds?: number },
  arg3?: number
): string {
  let userId = 'system';
  let expiresInSeconds = SIGNED_URL_DEFAULT_EXPIRY_SECONDS;

  if (typeof arg2 === 'string') {
    userId = arg2;
    if (typeof arg3 === 'number') {
      expiresInSeconds = arg3;
    }
  } else if (typeof arg2 === 'object' && arg2 !== null) {
    if (arg2.userId) userId = arg2.userId;
    if (arg2.expiresInMinutes) expiresInSeconds = arg2.expiresInMinutes * 60;
    if (arg2.expiresInSeconds) expiresInSeconds = arg2.expiresInSeconds;
  }

  const cleanKey = sanitizeStorageKey(storageKey);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const dataToSign = `${cleanKey}|${userId}|${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', getSigningKey())
    .update(dataToSign)
    .digest('hex');

  const params = new URLSearchParams({
    key: cleanKey,
    uid: userId,
    exp: expiresAt.toString(),
    sig: signature,
  });

  return `/api/documents/download?${params.toString()}`;
}

export interface VerifyResult {
  valid: boolean;
  storageKey?: string;
  userId?: string;
  error?: string;
}

/**
 * Validates the authenticity and expiration of a signed document request.
 */
export function verifySignedDocumentUrl(
  input:
    | string
    | {
        storageKey?: string;
        userId?: string;
        expiresAt?: number | string;
        signature?: string;
      }
): VerifyResult {
  let storageKey = '';
  let userId = 'system';
  let expiresAt = 0;
  let signature = '';

  if (typeof input === 'string') {
    try {
      const urlObj = new URL(input, 'https://localhost');
      storageKey = urlObj.searchParams.get('key') || '';
      userId = urlObj.searchParams.get('uid') || 'system';
      expiresAt = parseInt(urlObj.searchParams.get('exp') || '0', 10);
      signature = urlObj.searchParams.get('sig') || '';
    } catch {
      return { valid: false, error: 'Malformed URL' };
    }
  } else {
    storageKey = input.storageKey || '';
    userId = input.userId || 'system';
    expiresAt = typeof input.expiresAt === 'string' ? parseInt(input.expiresAt, 10) : input.expiresAt || 0;
    signature = input.signature || '';
  }

  try {
    const cleanKey = sanitizeStorageKey(storageKey);
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt < now) {
      return { valid: false, error: 'URL has expired' };
    }

    const dataToSign = `${cleanKey}|${userId}|${expiresAt}`;
    const expectedSig = crypto
      .createHmac('sha256', getSigningKey())
      .update(dataToSign)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSig);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
      return { valid: false, error: 'Invalid or tampered signature' };
    }

    return { valid: true, storageKey: cleanKey, userId };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Verification error' };
  }
}
