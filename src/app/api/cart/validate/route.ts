import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getEnrichedCart } from '@/lib/services/cartService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('indopharm_cart_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Cart session not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { destinationCountry, destinationJurisdiction } = body;

    const cart = await getEnrichedCart(sessionToken, destinationCountry, destinationJurisdiction);

    if (cart.items.length === 0) {
      return NextResponse.json(
        { success: false, code: 'CART_EMPTY', error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    if (!cart.eligibility.isPurchasable) {
      return NextResponse.json(
        {
          success: false,
          code: 'ELIGIBILITY_BLOCKED',
          error: 'One or more items in your cart are not eligible for delivery to your selected destination.',
          blockers: cart.eligibility.blockers,
          cart,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cart,
        isReadyForCheckout: true,
        requiresPrescription: cart.items.some((i) => i.requiresPrescription),
      },
    });
  } catch (error) {
    console.error('[API /api/cart/validate] Error:', error);
    return NextResponse.json({ success: false, error: 'Cart validation failed.' }, { status: 500 });
  }
}
