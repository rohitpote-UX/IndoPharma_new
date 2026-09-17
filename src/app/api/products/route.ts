import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/services/searchService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const destination = searchParams.get('destination') || 'US';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await searchProducts(
      '',
      {
        category,
        manufacturer,
      },
      destination
    );

    const paginatedItems = result.items.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedItems,
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[API /api/products] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve pharmaceutical catalog at this time.',
      },
      { status: 500 }
    );
  }
}
