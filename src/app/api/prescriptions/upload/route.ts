/**
 * POST /api/prescriptions/upload
 * ==============================================================================
 * Secure prescription document upload endpoint.
 * Requires authentication, validates CSRF, rate-limited, verifies MIME/size,
 * generates SHA-256 integrity hash, and saves to private storage.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { createPrescriptionSubmission } from '@/lib/services/prescriptionService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 1. Sliding-Window Rate Limit: 10 uploads per hour per IP
  const rateLimit = checkRateLimit(`rx_up_${ip}`, { maxRequests: 10, windowSeconds: 3600 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many upload attempts. Please try again later.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  // 2. CSRF Origin Validation
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    // 3. Authenticate user
    const session = requireAuth(req);

    // 4. Handle FormData or JSON payload
    const contentType = req.headers.get('content-type') || '';
    let prescriberName = '';
    let prescriberNpi = '';
    let prescriberState = '';
    let orderId: string | undefined;
    let patientConfirmation = false;
    let originalFileName = 'prescription.pdf';
    let mimeType = 'application/pdf';
    let fileBuffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      prescriberName = (formData.get('prescriberName') as string) || '';
      prescriberNpi = (formData.get('prescriberNpi') as string) || '';
      prescriberState = (formData.get('prescriberState') as string) || '';
      orderId = (formData.get('orderId') as string) || undefined;
      patientConfirmation = formData.get('patientConfirmation') === 'true' || formData.get('patientConfirmation') === '1';

      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Prescription document file is required.', code: 'MISSING_FILE' },
          { status: 400 }
        );
      }

      originalFileName = file.name || 'prescription.pdf';
      mimeType = file.type || 'application/pdf';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json().catch(() => ({}));
      prescriberName = body.prescriberName || '';
      prescriberNpi = body.prescriberNpi || '';
      prescriberState = body.prescriberState || '';
      orderId = body.orderId;
      patientConfirmation = Boolean(body.patientConfirmation);
      originalFileName = body.originalFileName || 'prescription.pdf';
      mimeType = body.mimeType || 'application/pdf';

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, 'base64');
      } else {
        return NextResponse.json(
          { success: false, error: 'File data is required.', code: 'MISSING_FILE' },
          { status: 400 }
        );
      }
    }

    const result = await createPrescriptionSubmission(
      {
        userId: session.userId,
        prescriberName,
        prescriberNpi,
        prescriberState,
        originalFileName,
        mimeType,
        fileBuffer,
        orderId,
        patientConfirmation,
      },
      { ipAddress: ip, userAgent }
    );

    return NextResponse.json({
      success: true,
      prescription: {
        id: result.id,
        status: result.status,
        prescriberName: result.prescriberName,
        originalFileName: result.originalFileName,
        version: result.version,
        createdAt: result.createdAt,
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'FORBIDDEN' ? 403 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Prescription upload failed.', code: err.code || 'UPLOAD_FAILED' },
      { status }
    );
  }
}
