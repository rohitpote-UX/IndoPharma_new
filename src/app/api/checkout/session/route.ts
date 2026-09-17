import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/services/checkoutService';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await req.json().catch(() => ({}));

    const sessionToken =
      body.sessionToken || cookieStore.get('indopharm_cart_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No active cart session found. Please add items to your cart first.' },
        { status: 400 }
      );
    }

    const destinationCountry =
      body.countryCode || cookieStore.get('indopharm_dest')?.value || 'US';
    const destinationJurisdiction = body.jurisdictionCode;

    const result = await createCheckoutSession(
      sessionToken,
      destinationCountry,
      destinationJurisdiction
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      session: result.session,
    });
  } catch (err: unknown) {
    console.error('[API /api/checkout/session POST error]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while initializing checkout.' },
      { status: 500 }
    );
  }
}
