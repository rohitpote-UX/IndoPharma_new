/**
 * ==============================================================================
 * INDOPHARM — PRESCRIPTION DOMAIN SLICE
 * ==============================================================================
 * Secure prescription intake, prescriber NPI validation, and clinical review.
 * ==============================================================================
 */

import { PrescriptionStatus } from '@/types';

export interface PrescriptionSubmission {
  patientId: string;
  prescriberName: string;
  prescriberNpi: string;
  prescriberState: string;
  documentFile: {
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    s3Key: string;
  };
  clinicalNotes?: string;
}

export interface PrescriptionVerificationRecord {
  prescriptionId: string;
  status: PrescriptionStatus;
  pharmacistId: string;
  verifiedAt: Date;
  refillsApproved: number;
  notes?: string;
}
