import { NextRequest, NextResponse } from 'next/server';
import { getProductPassport } from '@/lib/services/searchService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination') || 'US';

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product identifier is required.' },
        { status: 400 }
      );
    }

    const passport = await getProductPassport(slug, destination);

    if (!passport) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product Passport™ information is not available yet for this item.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: passport,
    });
  } catch (error) {
    console.error('[API /api/products/[slug]/passport] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load Product Passport™ at this time.',
      },
      { status: 500 }
    );
  }
}
