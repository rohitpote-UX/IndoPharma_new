/**
 * ==============================================================================
 * INDOPHARM — FORMATTING UTILITIES
 * ==============================================================================
 */

/**
 * Formats a numeric value into a USD currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an ISO date string or Date object into a readable date.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculates percentage savings between benchmark and actual cost.
 */
export function calculateSavings(benchmarkUsd: number, actualUsd: number): {
  savingsUsd: number;
  percentage: number;
} {
  const savingsUsd = Math.max(0, benchmarkUsd - actualUsd);
  const percentage = benchmarkUsd > 0 ? Math.round((savingsUsd / benchmarkUsd) * 100) : 0;
  return { savingsUsd, percentage };
}

/**
 * Obfuscates sensitive strings (e.g., patient phone, prescription NPI) for display.
 */
export function maskIdentifier(value: string, visibleEndChars: number = 4): string {
  if (value.length <= visibleEndChars) return value;
  const masked = '*'.repeat(value.length - visibleEndChars);
  return `${masked}${value.slice(-visibleEndChars)}`;
}
