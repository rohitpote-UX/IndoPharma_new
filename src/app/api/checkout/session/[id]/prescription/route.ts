import { NextRequest, NextResponse } from 'next/server';
import { submitPrescription } from '@/lib/services/checkoutService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await submitPrescription(id, {
      prescriberName: body.prescriberName,
      prescriberState: body.prescriberState,
      prescriberNpi: body.prescriberNpi,
      fileName: body.fileName,
      fileSizeBytes: body.fileSizeBytes,
      documentRef: body.documentRef,
      patientConfirmation: Boolean(body.patientConfirmation),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json({ success: true, session: result.session });
  } catch (err: unknown) {
    console.error('[API /api/checkout/session/[id]/prescription POST error]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record prescription details.' },
      { status: 500 }
    );
  }
}
