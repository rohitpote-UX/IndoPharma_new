import { NextRequest, NextResponse } from 'next/server';
import {
  getCheckoutSession,
  updateCustomerInfo,
  updateShippingAddress,
  selectShippingMethod,
  selectPaymentMethod,
} from '@/lib/services/checkoutService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCheckoutSession(id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Checkout session expired or not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    console.error('[API /api/checkout/session/[id] GET error]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve checkout session.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    switch (body.action) {
      case 'CUSTOMER_INFO': {
        const res = await updateCustomerInfo(id, body.customerInfo);
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error }, { status: 422 });
        }
        return NextResponse.json({ success: true, session: res.session });
      }

      case 'ADDRESS': {
        const res = await updateShippingAddress(id, body.shippingAddress);
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error }, { status: 422 });
        }
        return NextResponse.json({ success: true, session: res.session });
      }

      case 'SHIPPING_METHOD': {
        const res = await selectShippingMethod(id, body.shippingMethodId);
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error }, { status: 422 });
        }
        return NextResponse.json({ success: true, session: res.session });
      }

      case 'PAYMENT_METHOD': {
        const res = await selectPaymentMethod(id, body.paymentMethod);
        if (!res.success) {
          return NextResponse.json({ success: false, error: res.error }, { status: 422 });
        }
        return NextResponse.json({ success: true, session: res.session });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Invalid or unsupported checkout action: ${body.action}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    console.error('[API /api/checkout/session/[id] PATCH error]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update checkout state.' },
      { status: 500 }
    );
  }
}
