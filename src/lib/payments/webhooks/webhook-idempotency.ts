/**
 * ==============================================================================
 * INDOPHARM — WEBHOOK IDEMPOTENCY
 * ==============================================================================
 * Prevents the same provider webhook event from being processed more than once.
 *
 * The @@unique([provider, providerEventId]) constraint on WebhookEvent ensures
 * database-level deduplication even under concurrent delivery.
 *
 * Flow:
 *   1. receiveWebhookEvent() — attempts to create a WebhookEvent record
 *   2. If already exists → return the existing record (skip processing)
 *   3. If new → return null (proceed with processing)
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export interface WebhookEventRecord {
  id: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  processingStatus: string;
  signatureVerified: boolean;
  payloadHash: string | null;
  alreadyProcessed: boolean;
}

/**
 * Attempts to record a new webhook event.
 *
 * Returns:
 *  - { alreadyProcessed: false, id: string } if this is a new event — proceed with processing
 *  - { alreadyProcessed: true, id: string } if this event was already recorded — skip
 *
 * The unique constraint on (provider, providerEventId) ensures exactly-once
 * semantics even under concurrent requests.
 */
export async function receiveWebhookEvent(input: {
  provider: string;
  providerEventId: string;
  eventType: string;
  signatureVerified: boolean;
  payloadHash?: string;
  rawPayload?: Record<string, unknown>;
}): Promise<{ alreadyProcessed: boolean; webhookEventId: string }> {
  try {
    const record = await prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        providerEventId: input.providerEventId,
        eventType: input.eventType,
        signatureVerified: input.signatureVerified,
        payloadHash: input.payloadHash,
        rawPayload: input.rawPayload as Prisma.InputJsonValue | undefined,
        processingStatus: 'RECEIVED',
      },
    });

    return { alreadyProcessed: false, webhookEventId: record.id };
  } catch (err) {
    // Unique constraint violation = duplicate event
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const existing = await prisma.webhookEvent.findUnique({
        where: {
          provider_providerEventId: {
            provider: input.provider,
            providerEventId: input.providerEventId,
          },
        },
      });

      return {
        alreadyProcessed: true,
        webhookEventId: existing?.id ?? 'unknown',
      };
    }

    throw err;
  }
}

/**
 * Marks a webhook event as PROCESSING.
 * Call immediately before processing begins.
 */
export async function markWebhookProcessing(webhookEventId: string): Promise<void> {
  await prisma.webhookEvent.update({
    where: { id: webhookEventId },
    data: { processingStatus: 'PROCESSING' },
  });
}

/**
 * Marks a webhook event as FAILED with an error message.
 * Call if processing throws an unrecoverable error.
 */
export async function markWebhookFailed(
  webhookEventId: string,
  errorMessage: string
): Promise<void> {
  await prisma.webhookEvent.update({
    where: { id: webhookEventId },
    data: {
      processingStatus: 'FAILED',
      processingError: errorMessage.slice(0, 500), // Truncate to DB limit
      processedAt: new Date(),
    },
  });
}
