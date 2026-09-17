/**
 * POST /api/payments/webhooks/[provider]
 * ==============================================================================
 * Provider webhook endpoint.
 *
 * CRITICAL SECURITY REQUIREMENTS:
 *  1. Raw body MUST be read before any parsing — signature covers raw bytes
 *  2. Signature verification happens BEFORE any payload processing
 *  3. No authentication headers required (public endpoint — provider delivers here)
 *  4. Always return 200 on valid signature, even if already processed (idempotency)
 *  5. Return 401 ONLY on signature verification failure
 *  6. Never expose internal error details in the response body
 *
 * IMPORTANT — Next.js Body Parsing:
 * This route reads the raw body using req.arrayBuffer() to ensure the signature
 * covers the exact bytes the provider signed. JSON.parse() is NEVER called
 * before signature verification.
 *
 * Rate limiting should be configured at the infrastructure level (CDN/WAF).
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/payments/webhooks/webhook-handler';
import { WebhookVerificationError } from '@/lib/payments/domain/payment-errors';

interface Params {
  params: Promise<{ provider: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || `whk_${Date.now()}`;

  try {
    const { provider } = await params;

    // 1. Read raw body as Buffer — MUST happen before any JSON parsing
    const rawBodyBuffer = await req.arrayBuffer();
    const rawBody = Buffer.from(rawBodyBuffer);

    // 2. Collect all headers (lowercase keys for consistency)
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // 3. Process through webhook handler (verify → idempotency → normalize → process)
    const result = await handleWebhook(provider, rawBody, headers, requestId);

    // 4. Response strategy:
    //    - PROCESSED: 200 OK
    //    - DUPLICATE:  200 OK (provider should not retry)
    //    - FAILED:     200 OK (logged for investigation; retrying won't help for processing errors)
    //    - REJECTED:   401 (signature failed — provider should check their signing key)

    if (result.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Webhook authentication failed' },
        { status: 401 }
      );
    }

    // Return 200 for all other cases (PROCESSED, DUPLICATE, FAILED)
    // This prevents provider retry storms for permanent failures
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    // Unexpected error — never expose details to the provider
    console.error(`[POST /api/payments/webhooks/:provider] [${requestId}] Unexpected error:`, err);

    if (err instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: 'Webhook authentication failed' },
        { status: 401 }
      );
    }

    // Return 500 for unexpected errors — provider will retry
    return NextResponse.json(
      { error: 'Internal error processing webhook' },
      { status: 500 }
    );
  }
}
