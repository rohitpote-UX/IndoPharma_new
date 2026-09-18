/**
 * Notification Service (Phase 21 - Order Tracking & Milestone Alerts)
 * ==============================================================================
 * Event-driven notification dispatcher with deduplication for pharmaceutical
 * order milestones, prescription verification changes, and logistics stages.
 *
 * Prevents alert fatigue and carrier webhook loops via cryptographic/composite
 * deduplication keys with configurable cooldown windows.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';

export type NotificationType =
  | 'PRESCRIPTION_SUBMITTED'
  | 'PRESCRIPTION_VERIFIED'
  | 'PRESCRIPTION_REJECTED'
  | 'PRESCRIPTION_INFO_REQUESTED'
  | 'ORDER_CONFIRMED'
  | 'SHIPMENT_DISPATCHED'
  | 'CUSTOMS_CLEARED'
  | 'OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'DELIVERY_EXCEPTION';

export interface DispatchNotificationInput {
  userId: string;
  orderId?: string;
  prescriptionId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  sent: boolean;
  deduplicated: boolean;
  notificationId?: string;
  dedupKey: string;
}

// In-memory LRU-style cache for rapid webhook deduplication (60 min window)
const recentNotifications = new Map<string, number>();
const DEDUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function cleanExpiredDedupKeys() {
  const now = Date.now();
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > DEDUP_WINDOW_MS) {
      recentNotifications.delete(key);
    }
  }
}

export class NotificationService {
  /**
   * Generates a deterministic deduplication key
   */
  public static generateDedupKey(
    userId: string,
    type: NotificationType,
    referenceId?: string,
    subStage?: string
  ): string {
    return `${userId}:${type}:${referenceId || 'global'}:${subStage || 'default'}`;
  }

  /**
   * Dispatches a customer notification with automatic deduplication.
   */
  public static async dispatch(input: DispatchNotificationInput): Promise<NotificationResult> {
    cleanExpiredDedupKeys();

    const subStage = input.metadata?.stage || input.metadata?.status || '';
    const refId = input.orderId || input.prescriptionId || '';
    const dedupKey = this.generateDedupKey(input.userId, input.type, refId, subStage);

    const lastSentAt = recentNotifications.get(dedupKey);
    const now = Date.now();

    if (lastSentAt && now - lastSentAt < DEDUP_WINDOW_MS) {
      return {
        sent: false,
        deduplicated: true,
        dedupKey,
      };
    }

    // Mark as processed immediately
    recentNotifications.set(dedupKey, now);

    // Record in AuditLog for compliance audit trail
    const auditRecord = await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: `NOTIFICATION:${input.type}`,
        resourceType: input.orderId ? 'Order' : input.prescriptionId ? 'Prescription' : 'User',
        resourceId: input.orderId || input.prescriptionId || input.userId,
        newState: {
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata,
          dedupKey,
          deliveredAt: new Date().toISOString(),
        },
        ipAddress: 'internal:event-bus',
      },
    });

    // In a production environment with SMS/Email services (e.g., SendGrid, AWS SES, Twilio):
    // await emailProvider.sendTemplate({ to: userEmail, templateId: input.type, ... });
    // await smsProvider.sendNotification({ to: userPhone, body: input.message, ... });

    return {
      sent: true,
      deduplicated: false,
      notificationId: auditRecord.id,
      dedupKey,
    };
  }

  /**
   * Clears the in-memory deduplication cache (useful for testing)
   */
  public static clearCache(): void {
    recentNotifications.clear();
  }
}
