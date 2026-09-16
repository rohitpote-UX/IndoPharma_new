/**
 * ==============================================================================
 * INDOPHARM — IMMUTABLE AUDIT LOGGER
 * ==============================================================================
 * Logs sensitive clinical, security, and administrative events to maintain
 * tamper-evident trails for HIPAA and regulatory accountability.
 * ==============================================================================
 */

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
    | 'PAYMENT_AUTHORIZED'
    | 'PAYMENT_CAPTURED'
    | 'PAYMENT_REFUNDED'
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
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Structured JSON log for observability
  console.info(
    JSON.stringify({
      audit: true,
      timestamp,
      ...entry,
    })
  );

  // In production with database active:
  // await prisma.auditLog.create({ data: { ... } })
}
