/**
 * ==============================================================================
 * INDOPHARM — CRYPTOGRAPHIC PASSWORD HASHING ENGINE
 * ==============================================================================
 * Uses Node.js native crypto.scrypt with a 16-byte cryptographically secure salt.
 * Timing-safe comparison prevents side-channel timing attacks (Golden Rule 29).
 * Zero external native dependencies (eliminates node-gyp build failures).
 * ==============================================================================
 */

import crypto from 'crypto';

const SCRYPT_CONFIG = {
  N: 16384, // CPU/memory cost parameter
  r: 8,     // Block size parameter
  p: 1,     // Parallelization parameter
  keylen: 64, // Output key length in bytes
};

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password strength against IndoPharm's enterprise security policy.
 * Min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
 */
export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const errors: string[] = [];

  if (!password || password.length < 10) {
    errors.push('Password must be at least 10 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number/digit.');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Hashes a plaintext password using scrypt with a unique random salt.
 * Returns formatted modular crypt hash: $scrypt$N$r$p$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_CONFIG.keylen,
      { N: SCRYPT_CONFIG.N, r: SCRYPT_CONFIG.r, p: SCRYPT_CONFIG.p },
      (err, derivedKey) => {
        if (err) return reject(err);
        const hash = derivedKey.toString('hex');
        resolve(`$scrypt$${SCRYPT_CONFIG.N}$${SCRYPT_CONFIG.r}$${SCRYPT_CONFIG.p}$${salt}$${hash}`);
      }
    );
  });
}

/**
 * Verifies a plaintext password against a stored scrypt hash using timingSafeEqual.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const raw = storedHash.startsWith('$') ? storedHash.slice(1) : storedHash;
    const parts = raw.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') {
      return false;
    }

    const n = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = parts[4];
    const originalHash = Buffer.from(parts[5], 'hex');

    return new Promise((resolve) => {
      crypto.scrypt(
        password,
        salt,
        originalHash.length,
        { N: n, r, p },
        (err, derivedKey) => {
          if (err) return resolve(false);
          // Constant-time comparison to protect against timing attacks
          const match = crypto.timingSafeEqual(originalHash, derivedKey);
          resolve(match);
        }
      );
    });
  } catch {
    return false;
  }
}
