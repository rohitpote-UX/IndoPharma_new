/**
 * ==============================================================================
 * INDOPHARM — IMMUTABLE AUDIT LOGGER
 * ==============================================================================
 * Logs sensitive clinical, security, and administrative events to maintain
 * tamper-evident trails for HIPAA and regulatory accountability.
 *
 * Phase 15 update: DB writes are now active (prisma.auditLog.create).
 * This function never throws — audit failures must not break application flows.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export interface AuditLogEntry {
  userId?: string | null;
  userRole?: string | null;
  action:
    | 'PRESCRIPTION_UPLOADED'
    | 'PRESCRIPTION_VIEWED'
    | 'PRESCRIPTION_VERIFIED'
    | 'PRESCRIPTION_REJECTED'
    | 'ORDER_PLACED'
    | 'ORDER_STATUS_UPDATED'
    | 'PAYMENT_INTENT_CREATED'
    | 'PAYMENT_AUTHORIZED'
    | 'PAYMENT_CAPTURED'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_DISPUTED'
    | 'CUSTOMS_MANIFEST_GENERATED'
    | 'USER_LOGIN'
    | 'USER_LOGOUT';
  resourceType: 'Prescription' | 'Order' | 'Payment' | 'User' | 'Shipment';
  resourceId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatches an audit event to the persistent ledger.
 * Never throws — audit failures are logged to stderr but do not break flows.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Structured JSON log for observability / APM
  console.info(
    JSON.stringify({
      audit: true,
      timestamp,
      ...entry,
    })
  );

  // Persist to AuditLog table
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        userRole: entry.userRole,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    // Audit write failure must not propagate to the caller
    console.error('[AuditLog] Failed to write audit event to database:', err);
  }
}
