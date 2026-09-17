/**
 * ==============================================================================
 * INDOPHARM — VERIFICATION PROVIDER ABSTRACTION
 * ==============================================================================
 * Isolates patient identity and clinical prescription review orchestration.
 * Allows pluggable verification vendors (LexisNexis, Surescripts, manual QA).
 * ==============================================================================
 */

export interface CustomerVerificationData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  phone: string;
  addressState: string;
}

export interface PrescriptionVerificationData {
  prescriberName: string;
  prescriberNpi?: string;
  prescriberState?: string;
  documentRef?: string;
  patientConfirmation: boolean;
}

export interface VerificationResult {
  verificationId: string;
  status: 'VERIFIED' | 'NEEDS_CLINICAL_REVIEW' | 'REJECTED';
  reason?: string;
  verifiedAt: string;
  reviewedByRole?: string;
}

export interface VerificationProvider {
  readonly providerId: string;
  verifyCustomer(data: CustomerVerificationData): Promise<VerificationResult>;
  verifyPrescription(data: PrescriptionVerificationData): Promise<VerificationResult>;
  getVerificationStatus(verificationId: string): Promise<VerificationResult>;
}

export class MockVerificationProvider implements VerificationProvider {
  readonly providerId = 'mock-clinical-verification-engine';

  async verifyCustomer(_data: CustomerVerificationData): Promise<VerificationResult> {
    void _data;
    return {
      verificationId: `ver_cust_${Date.now()}`,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      reviewedByRole: 'SYSTEM_AUTOMATED_CHECK',
    };
  }

  async verifyPrescription(_data: PrescriptionVerificationData): Promise<VerificationResult> {
    void _data;
    // In pharmaceutical importation, all prescription uploads are routed to
    // our licensed clinical pharmacist queue prior to physical export dispatch
    return {
      verificationId: `ver_rx_${Date.now()}`,
      status: 'NEEDS_CLINICAL_REVIEW',
      reason: 'Scheduled for licensed clinical pharmacist pre-dispatch verification.',
      verifiedAt: new Date().toISOString(),
      reviewedByRole: 'CLINICAL_PHARMACIST_QUEUE',
    };
  }

  async getVerificationStatus(verificationId: string): Promise<VerificationResult> {
    return {
      verificationId,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
    };
  }
}

export function getVerificationProvider(): VerificationProvider {
  return new MockVerificationProvider();
}
