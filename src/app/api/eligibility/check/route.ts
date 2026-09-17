import { NextRequest, NextResponse } from 'next/server';
import { evaluateProductEligibility } from '@/lib/services/eligibilityService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, destination, quantity, customerId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product identifier is required.' },
        { status: 400 }
      );
    }

    const countryCode = destination?.countryCode || 'US';
    const jurisdictionCode = destination?.jurisdictionCode;

    const result = await evaluateProductEligibility({
      productId,
      destination: {
        countryCode,
        jurisdictionCode,
      },
      quantity: quantity || 1,
      customerId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API /api/eligibility/check] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to evaluate product eligibility at this time.',
      },
      { status: 500 }
    );
  }
}
