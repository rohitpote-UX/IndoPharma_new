import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getEnrichedCart, setCartDestination } from '@/lib/services/cartService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get('indopharm_cart_token')?.value;

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const jurisdiction = searchParams.get('jurisdiction') || undefined;

    let isNewToken = false;
    if (!sessionToken) {
      sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      isNewToken = true;
    }

    const cart = country
      ? await setCartDestination(sessionToken, country, jurisdiction)
      : await getEnrichedCart(sessionToken);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    if (isNewToken) {
      response.cookies.set('indopharm_cart_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('[API /api/cart] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to retrieve cart at this time.' },
      { status: 500 }
    );
  }
}
