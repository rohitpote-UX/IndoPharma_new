/**
 * ==============================================================================
 * INDOPHARM — MONEY VALUE OBJECT
 * ==============================================================================
 * Financial amounts are NEVER stored or transmitted as floating-point numbers.
 * All monetary values use integer minor units (e.g. 12500 = $125.00 USD).
 *
 * Rules:
 *  - USD: 2 decimal places → minor unit = cents (1 USD = 100 cents)
 *  - JPY: 0 decimal places → zero-decimal (1 JPY = 1 unit)
 *  - KWD: 3 decimal places → 1 KWD = 1000 fils
 * ==============================================================================
 */

export interface Money {
  /** Integer minor units — e.g. 12500 for $125.00 USD */
  amountMinorUnits: number;
  /** ISO 4217 currency code */
  currency: string;
}

/**
 * Currency metadata registry.
 * Extend this map before supporting a new currency.
 */
const CURRENCY_METADATA: Record<string, { minorUnitExponent: number; zeroDecimal: boolean }> = {
  USD: { minorUnitExponent: 2, zeroDecimal: false },
  INR: { minorUnitExponent: 2, zeroDecimal: false },
  EUR: { minorUnitExponent: 2, zeroDecimal: false },
  GBP: { minorUnitExponent: 2, zeroDecimal: false },
  CAD: { minorUnitExponent: 2, zeroDecimal: false },
  AUD: { minorUnitExponent: 2, zeroDecimal: false },
  JPY: { minorUnitExponent: 0, zeroDecimal: true },
  KWD: { minorUnitExponent: 3, zeroDecimal: false },
};

/**
 * Returns the currency metadata for a given ISO 4217 code.
 * Throws if the currency is unknown — this is intentional; unknown currencies
 * must be explicitly added, not silently assumed.
 */
export function getCurrencyMetadata(currency: string): { minorUnitExponent: number; zeroDecimal: boolean } {
  const meta = CURRENCY_METADATA[currency.toUpperCase()];
  if (!meta) {
    throw new Error(
      `[Money] Unknown currency: "${currency}". Add it to CURRENCY_METADATA before processing payments in this currency.`
    );
  }
  return meta;
}

/**
 * Converts a decimal amount (e.g. 125.00) to integer minor units (e.g. 12500).
 * Input MUST be a string or Prisma Decimal to avoid float precision loss.
 */
export function toMinorUnits(decimalAmount: string | number, currency: string): number {
  const meta = getCurrencyMetadata(currency);
  const factor = Math.pow(10, meta.minorUnitExponent);
  // Parse via string to avoid floating-point rounding errors
  const parsed = typeof decimalAmount === 'number'
    ? parseFloat(decimalAmount.toFixed(meta.minorUnitExponent + 2))
    : parseFloat(decimalAmount);
  if (isNaN(parsed)) {
    throw new Error(`[Money] Invalid decimal amount: "${decimalAmount}"`);
  }
  return Math.round(parsed * factor);
}

/**
 * Converts integer minor units back to a decimal amount string.
 * Used ONLY for display / logging. Never use the result in financial calculations.
 */
export function fromMinorUnits(minorUnits: number, currency: string): string {
  const meta = getCurrencyMetadata(currency);
  const factor = Math.pow(10, meta.minorUnitExponent);
  return (minorUnits / factor).toFixed(meta.minorUnitExponent);
}

/**
 * Formats a Money value for safe display (e.g. "$125.00 USD").
 * Never use this output as input to financial calculations.
 */
export function formatMoney(money: Money): string {
  return `${fromMinorUnits(money.amountMinorUnits, money.currency)} ${money.currency}`;
}

/**
 * Creates a Money value object.
 */
export function createMoney(amountMinorUnits: number, currency: string): Money {
  if (!Number.isInteger(amountMinorUnits)) {
    throw new Error(`[Money] amountMinorUnits must be an integer. Got: ${amountMinorUnits}`);
  }
  if (amountMinorUnits < 0) {
    throw new Error(`[Money] amountMinorUnits must be non-negative. Got: ${amountMinorUnits}`);
  }
  getCurrencyMetadata(currency); // Validates currency code
  return { amountMinorUnits, currency: currency.toUpperCase() };
}

/**
 * Adds two Money values. Throws if currencies differ.
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`[Money] Cannot add different currencies: ${a.currency} + ${b.currency}`);
  }
  return createMoney(a.amountMinorUnits + b.amountMinorUnits, a.currency);
}

/**
 * Checks if a + b exceeds limit. Used to validate refund totals.
 */
export function wouldExceed(a: Money, b: Money, limit: Money): boolean {
  if (a.currency !== b.currency || a.currency !== limit.currency) {
    throw new Error('[Money] Currency mismatch in wouldExceed check');
  }
  return a.amountMinorUnits + b.amountMinorUnits > limit.amountMinorUnits;
}
