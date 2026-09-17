import { NextRequest, NextResponse } from 'next/server';
import { executeFinalOrderPlacement } from '@/lib/services/checkoutService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const idempotencyKey = body.idempotencyKey || `idem_${id}_fallback`;

    const result = await executeFinalOrderPlacement(id, idempotencyKey);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.result,
    });
  } catch (err: unknown) {
    console.error('[API /api/checkout/session/[id]/place-order POST error]', err);
    return NextResponse.json(
      { success: false, error: 'Order processing failed. Please try again or contact pharmacy care.' },
      { status: 500 }
    );
  }
}
