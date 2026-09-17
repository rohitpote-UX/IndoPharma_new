/**
 * ==============================================================================
 * INDOPHARM — WEBHOOK HANDLER
 * ==============================================================================
 * Processes incoming provider webhooks through the full security + idempotency
 * + normalization pipeline before delegating to the PaymentService.
 *
 * Processing flow:
 *   1. Verify webhook signature (adapter-specific)
 *   2. Check idempotency (reject duplicates safely)
 *   3. Mark event as PROCESSING
 *   4. Normalize raw event to NormalizedPaymentEvent
 *   5. Delegate to PaymentService.handleNormalizedEvent()
 *   6. Mark event as PROCESSED
 *
 * Security rules:
 *   - Signature must be verified BEFORE any payload is processed
 *   - Unverified webhooks are NEVER processed
 *   - Duplicate events are acknowledged with 200 OK (per provider expectations)
 *   - Failed events are logged for manual investigation
 *
 * IMPORTANT: Never mark an order paid based on a webhook alone without also
 * verifying the amount and currency match the internal payment record.
 * (This verification happens inside PaymentService.handleNormalizedEvent)
 * ==============================================================================
 */

import { getPaymentAdapter } from '../provider';
import { handleNormalizedEvent } from '../service';
import { WebhookVerificationError } from '../domain/payment-errors';
import {
  receiveWebhookEvent,
  markWebhookProcessing,
  markWebhookFailed,
} from './webhook-idempotency';
import { logPaymentAuditEvent } from '../audit';

export interface WebhookHandlerResult {
  /** Whether the webhook was acknowledged (return 200 to provider) */
  acknowledged: boolean;
  /** Whether this webhook was already processed (idempotency) */
  alreadyProcessed: boolean;
  /** Human-readable processing status */
  status: 'PROCESSED' | 'DUPLICATE' | 'FAILED' | 'REJECTED';
  error?: string;
}

/**
 * Processes a provider webhook request.
 *
 * @param provider - Provider code (e.g. "mock")
 * @param rawBody - Raw request body bytes (MUST NOT be pre-parsed)
 * @param headers - All request headers
 * @param requestId - Correlation ID for tracing
 */
export async function handleWebhook(
  provider: string,
  rawBody: Buffer | string,
  headers: Record<string, string>,
  requestId?: string
): Promise<WebhookHandlerResult> {
  const adapter = getPaymentAdapter();

  // 1. Verify the provider matches the configured adapter
  if (adapter.providerId !== provider) {
    console.warn(
      `[WebhookHandler] Received webhook for provider "${provider}" but active adapter is "${adapter.providerId}"`
    );
    // Still attempt processing — in multi-provider setup this would route differently
  }

  // 2. Verify webhook signature (cryptographic authenticity check)
  let verifiedEvent;
  try {
    verifiedEvent = await adapter.verifyWebhook({ rawBody, headers, provider });
  } catch (err) {
    // NEVER process an unverified webhook
    const errorMsg = err instanceof WebhookVerificationError
      ? err.message
      : 'Webhook verification failed';

    console.error(`[WebhookHandler] Signature verification failed: ${errorMsg}`);

    await logPaymentAuditEvent({
      action: 'WEBHOOK_VERIFICATION_FAILED',
      actor: 'WEBHOOK',
      providerId: provider,
      metadata: { error: errorMsg, requestId },
      requestId,
    });

    return {
      acknowledged: false,
      alreadyProcessed: false,
      status: 'REJECTED',
      error: errorMsg,
    };
  }

  // 3. Idempotency check — record or detect duplicate
  const idempotencyResult = await receiveWebhookEvent({
    provider,
    providerEventId: verifiedEvent.providerEventId,
    eventType: verifiedEvent.providerEventType,
    signatureVerified: true,
    payloadHash: verifiedEvent.payloadHash,
    rawPayload: verifiedEvent.rawPayload,
  });

  if (idempotencyResult.alreadyProcessed) {
    console.info(
      `[WebhookHandler] Duplicate webhook ignored: ${provider}/${verifiedEvent.providerEventId}`
    );
    // Return 200 to provider — they don't need to retry
    return {
      acknowledged: true,
      alreadyProcessed: true,
      status: 'DUPLICATE',
    };
  }

  const { webhookEventId } = idempotencyResult;

  // 4. Mark as PROCESSING
  await markWebhookProcessing(webhookEventId);

  // 5. Normalize event to provider-agnostic type
  let normalizedEvent;
  try {
    normalizedEvent = await adapter.normalizeWebhookEvent(verifiedEvent);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Normalization failed';
    await markWebhookFailed(webhookEventId, errorMsg);

    console.error(`[WebhookHandler] Event normalization failed: ${errorMsg}`);
    return {
      acknowledged: true, // Still ack to prevent retries that would also fail
      alreadyProcessed: false,
      status: 'FAILED',
      error: errorMsg,
    };
  }

  // 6. Delegate to PaymentService for business logic processing
  try {
    await handleNormalizedEvent(normalizedEvent, webhookEventId);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Processing failed';
    await markWebhookFailed(webhookEventId, errorMsg);

    console.error(
      `[WebhookHandler] Failed to process normalized event ${normalizedEvent.type}: ${errorMsg}`
    );

    return {
      acknowledged: true, // Ack to prevent infinite retries; log for manual investigation
      alreadyProcessed: false,
      status: 'FAILED',
      error: errorMsg,
    };
  }

  await logPaymentAuditEvent({
    webhookEventId,
    action: 'WEBHOOK_PROCESSED',
    actor: 'WEBHOOK',
    providerId: provider,
    providerEventId: verifiedEvent.providerEventId,
    metadata: { eventType: normalizedEvent.type, requestId },
    requestId,
  });

  return {
    acknowledged: true,
    alreadyProcessed: false,
    status: 'PROCESSED',
  };
}
