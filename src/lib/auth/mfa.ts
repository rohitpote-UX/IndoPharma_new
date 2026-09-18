/**
 * ==============================================================================
 * INDOPHARM — MULTI-FACTOR AUTHENTICATION (MFA / TOTP)
 * ==============================================================================
 * Implements RFC 6238 Time-based One-Time Password (TOTP) engine.
 * Mandatory for privileged administrative roles (ADMIN, SUPER_ADMIN, CLINICAL_PHARMACIST).
 * Zero external dependencies — native Node.js crypto.
 * ==============================================================================
 */

import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a cryptographically random 20-byte base32 TOTP secret.
 */
export function generateMfaSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

export const generateTotpSecret = generateMfaSecret;

/**
 * Computes a 6-digit TOTP code for a given timestamp and secret.
 */
export function generateTotpCode(secret: string, timestampMs: number = Date.now()): string {
  const key = base32Decode(secret);
  const timeStep = Math.floor(timestampMs / 1000 / 30); // 30-second window

  // Convert timeStep to 8-byte big-endian buffer
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, '0');
}

export const generateTotp = generateTotpCode;

/**
 * Verifies a 6-digit TOTP token against a secret with clock drift tolerance (±1 step).
 */
export function verifyTotp(
  token: string,
  secret: string,
  window: number = 1,
  referenceTimeMs: number = Date.now()
): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false;
  }

  // Check windows: -1, 0, +1 (each 30s)
  for (let offset = -window; offset <= window; offset++) {
    const checkTime = referenceTimeMs + offset * 30 * 1000;
    const expected = generateTotpCode(secret, checkTime);
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates emergency recovery codes (e.g. 8 alphanumeric codes of format xxxx-xxxx).
 */
export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toLowerCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}
