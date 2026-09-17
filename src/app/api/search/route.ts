import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions } from '@/lib/services/searchService';
import { ProductAvailabilityState } from '@/lib/domain/product';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const suggest = searchParams.get('suggest') === 'true';
    const category = searchParams.get('category') || undefined;
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const prescription = searchParams.get('prescription');
    const availability = searchParams.get('availability') as ProductAvailabilityState | undefined;
    const destination = searchParams.get('destination') || 'US';

    // If query is for suggestions only
    if (suggest) {
      const suggestions = await getSearchSuggestions(q);
      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    }

    const prescriptionRequired =
      prescription === 'true' ? true : prescription === 'false' ? false : undefined;

    const result = await searchProducts(
      q,
      {
        category,
        manufacturer,
        prescriptionRequired,
        availability,
        destination,
      },
      destination
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API /api/search] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to execute search at this time.',
      },
      { status: 500 }
    );
  }
}
