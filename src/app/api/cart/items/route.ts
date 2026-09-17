import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addItemToCart } from '@/lib/services/cartService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get('indopharm_cart_token')?.value;

    let isNewToken = false;
    if (!sessionToken) {
      sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      isNewToken = true;
    }

    const body = await request.json();
    const { productId, quantity = 1, destinationCountry } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const result = await addItemToCart(sessionToken, productId, quantity, destinationCountry);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          code: result.code,
          error: result.error || 'Failed to add product to cart due to destination restrictions.',
        },
        { status: 422 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: result.cart,
    });

    if (isNewToken) {
      response.cookies.set('indopharm_cart_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error('[API /api/cart/items] Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while adding to cart.' },
      { status: 500 }
    );
  }
}
