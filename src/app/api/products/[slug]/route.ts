import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/services/searchService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required.' },
        { status: 400 }
      );
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'This pharmaceutical product was not found in the verified catalogue.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('[API /api/products/[slug]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve product information at this time.',
      },
      { status: 500 }
    );
  }
}
