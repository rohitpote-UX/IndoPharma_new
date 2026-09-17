import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateCartItemQuantity, removeCartItem } from '@/lib/services/cartService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('indopharm_cart_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Cart session not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || typeof quantity !== 'number') {
      return NextResponse.json({ success: false, error: 'Valid quantity number is required.' }, { status: 400 });
    }

    const result = await updateCartItemQuantity(sessionToken, id, quantity);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update item.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.cart,
    });
  } catch (error) {
    console.error('[API /api/cart/items/[id] PATCH] Error:', error);
    return NextResponse.json({ success: false, error: 'Unable to update item quantity.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('indopharm_cart_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Cart session not found.' }, { status: 404 });
    }

    const result = await removeCartItem(sessionToken, id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to remove item.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.cart,
    });
  } catch (error) {
    console.error('[API /api/cart/items/[id] DELETE] Error:', error);
    return NextResponse.json({ success: false, error: 'Unable to remove item from cart.' }, { status: 500 });
  }
}
