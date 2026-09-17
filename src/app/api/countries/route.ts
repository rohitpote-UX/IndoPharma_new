import { NextResponse } from 'next/server';
import { APPROVED_COUNTRIES } from '@/lib/services/eligibilityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: APPROVED_COUNTRIES,
    });
  } catch (error) {
    console.error('[API /api/countries] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to retrieve destination countries.' },
      { status: 500 }
    );
  }
}
