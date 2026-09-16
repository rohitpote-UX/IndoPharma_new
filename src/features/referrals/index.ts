/**
 * ==============================================================================
 * INDOPHARM — REFERRAL & RETENTION DOMAIN SLICE
 * ==============================================================================
 */

export interface ReferralProgramState {
  referralCode: string;
  shareableUrl: string;
  totalReferralsCount: number;
  availableCreditUsd: number;
  pendingCreditUsd: number;
}
