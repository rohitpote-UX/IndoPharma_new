/**
 * POST /api/prescriptions/[id]/resubmit
 * ==============================================================================
 * Customer resubmission endpoint when more information is requested or rejected.
 * Increments version and preserves audit history without overwriting previous files.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { resubmitPrescription } from '@/lib/services/prescriptionService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const session = requireAuth(req);
    const { id } = await params;

    const contentType = req.headers.get('content-type') || '';
    let originalFileName = 'resubmitted-prescription.pdf';
    let mimeType = 'application/pdf';
    let fileBuffer: Buffer;
    let prescriberName: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      prescriberName = (formData.get('prescriberName') as string) || undefined;
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'File document is required for resubmission.', code: 'MISSING_FILE' },
          { status: 400 }
        );
      }
      originalFileName = file.name || 'resubmitted-prescription.pdf';
      mimeType = file.type || 'application/pdf';
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      const body = await req.json().catch(() => ({}));
      prescriberName = body.prescriberName;
      originalFileName = body.originalFileName || 'resubmitted-prescription.pdf';
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

    const updated = await resubmitPrescription(
      id,
      {
        fileBuffer,
        originalFileName,
        mimeType,
        prescriberName,
      },
      session,
      { ipAddress: ip, userAgent }
    );

    return NextResponse.json({
      success: true,
      prescription: {
        id: updated.id,
        status: updated.status,
        version: updated.version,
        originalFileName: updated.originalFileName,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'IDOR_REJECTED' ? 403 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Resubmission failed.', code: err.code || 'RESUBMIT_FAILED' },
      { status }
    );
  }
}
