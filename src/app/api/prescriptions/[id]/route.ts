/**
 * GET /api/prescriptions/[id]
 * ==============================================================================
 * Retrieves prescription details and generates a short-lived (15-min) signed URL.
 * Enforces strict object-level IDOR validation:
 *  - Patients can only view their own prescription.
 *  - Clinical reviewers can inspect prescriptions for verification.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { getPrescriptionById } from '@/lib/services/prescriptionService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const session = requireAuth(req);
    const { id } = await params;

    const prescription = await getPrescriptionById(id, session, { ipAddress: ip, userAgent });

    // Data minimization: Don't expose internal reviewer notes to patients
    const isClinicalStaff =
      session.role === 'CLINICAL_PHARMACIST' ||
      session.role === 'COMPLIANCE_ADMIN' ||
      session.role === 'SUPER_ADMIN';

    const safeResponse = {
      id: prescription.id,
      prescriberName: prescription.prescriberName,
      prescriberNpi: isClinicalStaff ? prescription.prescriberNpi : undefined,
      prescriberState: prescription.prescriberState,
      originalFileName: prescription.originalFileName,
      mimeType: prescription.mimeType,
      fileSizeBytes: prescription.fileSizeBytes,
      status: prescription.status,
      rejectionReasonCode: prescription.rejectionReasonCode,
      customerMessage: prescription.customerMessage,
      verificationNotes: isClinicalStaff ? prescription.verificationNotes : undefined,
      verifiedAt: prescription.verifiedAt,
      expiresAt: prescription.expiresAt,
      version: prescription.version,
      refillsRemaining: prescription.refillsRemaining,
      orders: prescription.orders,
      downloadUrl: prescription.downloadUrl,
      createdAt: prescription.createdAt,
    };

    return NextResponse.json({ success: true, prescription: safeResponse });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'IDOR_REJECTED' ? 403 : 404);
    return NextResponse.json(
      { success: false, error: err.message || 'Prescription not found.', code: err.code || 'PRESCRIPTION_ERROR' },
      { status }
    );
  }
}
