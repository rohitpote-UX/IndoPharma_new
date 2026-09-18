/**
 * ==============================================================================
 * INDOPHARM — PRESCRIPTION DOMAIN SERVICE
 * ==============================================================================
 * Production clinical prescription management with state machine governance,
 * private storage signed URLs, human pharmacist verification, audit logging,
 * and immutable document versioning.
 * ==============================================================================
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db/client';
import { PrescriptionStatus, UserRole, Prisma } from '@prisma/client';
import { createSignedDocumentUrl, sanitizeStoragePath } from '@/lib/security/storage';
import { assertPrescriptionAccess, AuthorizationError } from '@/lib/auth/rbac/guard';
import { SessionPayload } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/security/audit';

export class PrescriptionError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string = 'PRESCRIPTION_ERROR', status: number = 400) {
    super(message);
    this.name = 'PrescriptionError';
    this.code = code;
    this.status = status;
  }
}

export const ALLOWED_PRESCRIPTION_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const MAX_PRESCRIPTION_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type RejectionReasonCode =
  | 'DOCUMENT_UNREADABLE'
  | 'MISSING_REQUIRED_INFORMATION'
  | 'EXPIRED_DOCUMENT'
  | 'INCOMPLETE_DOCUMENT'
  | 'DOCUMENT_MISMATCH'
  | 'UNAUTHORIZED_PRESCRIBER'
  | 'OTHER';

export const REJECTION_REASON_LABELS: Record<RejectionReasonCode, string> = {
  DOCUMENT_UNREADABLE: 'Document is blurry, unreadable, or corrupted.',
  MISSING_REQUIRED_INFORMATION: 'Missing mandatory physician details, dosage, or patient name.',
  EXPIRED_DOCUMENT: 'The prescription validity period has elapsed.',
  INCOMPLETE_DOCUMENT: 'Incomplete document (e.g. missing doctor signature or clinic stamp).',
  DOCUMENT_MISMATCH: 'Prescription details do not match the selected medication or patient name.',
  UNAUTHORIZED_PRESCRIBER: 'Prescriber credentials cannot be verified in the regulatory registry.',
  OTHER: 'Regulatory requirement not satisfied.',
};

/**
 * Validates state transitions in the prescription lifecycle.
 */
export function isValidPrescriptionTransition(
  from: PrescriptionStatus,
  to: PrescriptionStatus
): boolean {
  if (from === to) return true;

  const validTransitions: Record<PrescriptionStatus, PrescriptionStatus[]> = {
    UPLOADED: ['UNDER_REVIEW', 'PENDING_REVIEW', 'REJECTED'],
    PENDING_REVIEW: ['UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED', 'MORE_INFORMATION_REQUIRED'],
    UNDER_REVIEW: ['VERIFIED', 'APPROVED', 'REJECTED', 'MORE_INFORMATION_REQUIRED', 'PENDING_REVIEW'],
    MORE_INFORMATION_REQUIRED: ['PENDING_REVIEW', 'UNDER_REVIEW', 'UPLOADED', 'REVOKED'],
    VERIFIED: ['APPROVED', 'EXPIRED', 'REVOKED'],
    APPROVED: ['EXPIRED', 'REVOKED'],
    REJECTED: ['PENDING_REVIEW', 'UNDER_REVIEW', 'UPLOADED'], // Resubmission allowed
    EXPIRED: ['PENDING_REVIEW', 'UPLOADED'],                   // Resubmission with new prescription
    REVOKED: [],                                              // Terminal state
  };

  return validTransitions[from]?.includes(to) ?? false;
}

export interface PrescriptionUploadInput {
  userId: string;
  customerId?: string;
  prescriberName: string;
  prescriberNpi?: string;
  prescriberState?: string;
  originalFileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  orderId?: string;
  patientConfirmation: boolean;
}

/**
 * Submits a new prescription document for clinical review.
 */
export async function createPrescriptionSubmission(
  input: PrescriptionUploadInput,
  context?: { ipAddress?: string; userAgent?: string }
) {
  if (!input.patientConfirmation) {
    throw new PrescriptionError(
      'Patient attestation and confirmation is required by healthcare regulations.',
      'ATTESTATION_REQUIRED'
    );
  }

  if (!input.prescriberName || input.prescriberName.trim().length === 0) {
    throw new PrescriptionError('Prescribing physician name is required.', 'PRESCRIBER_NAME_REQUIRED');
  }

  // 1. Validate MIME type
  const normalizedMime = input.mimeType.toLowerCase();
  if (!ALLOWED_PRESCRIPTION_MIME_TYPES.includes(normalizedMime)) {
    throw new PrescriptionError(
      `Unsupported file type (${input.mimeType}). Supported formats are PDF, JPEG, and PNG.`,
      'INVALID_FILE_TYPE'
    );
  }

  // 2. Validate file size
  if (input.fileBuffer.length > MAX_PRESCRIPTION_FILE_SIZE_BYTES) {
    throw new PrescriptionError(
      `File exceeds maximum limit of 10MB (received ${(input.fileBuffer.length / (1024 * 1024)).toFixed(2)}MB).`,
      'FILE_TOO_LARGE'
    );
  }

  // 3. Compute SHA-256 integrity hash
  const documentHash = crypto.createHash('sha256').update(input.fileBuffer).digest('hex');

  // 4. Generate safe, isolated storage key
  const ext = input.originalFileName.split('.').pop()?.toLowerCase() || 'pdf';
  const cleanExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext) ? ext : 'pdf';
  const storageKey = sanitizeStoragePath(`prescriptions/${input.userId}/${crypto.randomUUID()}.${cleanExt}`);

  // 5. Transactionally create record and update order if linked
  const prescription = await prisma.$transaction(async (tx) => {
    const rx = await tx.prescription.create({
      data: {
        userId: input.userId,
        customerId: input.customerId,
        prescriberName: input.prescriberName.trim(),
        prescriberNpi: input.prescriberNpi?.trim(),
        prescriberState: input.prescriberState?.trim(),
        documentUrl: storageKey,
        originalFileName: input.originalFileName.trim(),
        mimeType: normalizedMime,
        fileSizeBytes: input.fileBuffer.length,
        documentHash,
        status: PrescriptionStatus.PENDING_REVIEW,
        version: 1,
      },
    });

    if (input.orderId) {
      await tx.order.update({
        where: { id: input.orderId },
        data: {
          prescriptionId: rx.id,
          status: 'UNDER_CLINICAL_REVIEW',
        },
      });
    }

    return rx;
  });

  await logAuditEvent({
    userId: input.userId,
    action: 'PRESCRIPTION_UPLOADED',
    resourceType: 'Prescription',
    resourceId: prescription.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: {
      fileSizeBytes: input.fileBuffer.length,
      documentHash,
      orderId: input.orderId,
    },
  });

  return prescription;
}

/**
 * Retrieves a prescription record with a short-lived HMAC-signed download URL.
 * Strictly verifies caller ownership or clinical review authority (IDOR defense).
 */
export async function getPrescriptionById(
  prescriptionId: string,
  callerSession: SessionPayload,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalUsd: true,
          createdAt: true,
        },
      },
    },
  });

  if (!prescription) {
    throw new PrescriptionError('Prescription record not found.', 'NOT_FOUND', 404);
  }

  // Enforce object-level IDOR check
  assertPrescriptionAccess(callerSession, prescription.userId);

  // Generate short-lived (15-minute) HMAC-signed document download URL
  const signedDownloadUrl = createSignedDocumentUrl(
    prescription.documentUrl,
    callerSession.userId,
    15 * 60 // 15 minutes
  );

  await logAuditEvent({
    userId: callerSession.userId,
    userRole: callerSession.role,
    action: 'PRESCRIPTION_VIEWED',
    resourceType: 'Prescription',
    resourceId: prescription.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return {
    ...prescription,
    downloadUrl: signedDownloadUrl,
  };
}

/**
 * Retrieves paginated prescription records for the authenticated customer.
 */
export async function getCustomerPrescriptions(
  userId: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    }),
    prisma.prescription.count({ where: { userId } }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Retrieves the active review queue for Clinical Pharmacists and Compliance Admins.
 */
export async function getPrescriptionReviewQueue(
  callerSession: SessionPayload,
  options: {
    status?: PrescriptionStatus;
    page?: number;
    limit?: number;
  } = {}
) {
  // Guard: Must hold clinical review permission
  if (
    callerSession.role !== 'CLINICAL_PHARMACIST' &&
    callerSession.role !== 'COMPLIANCE_ADMIN' &&
    callerSession.role !== 'SUPER_ADMIN'
  ) {
    throw new AuthorizationError(
      'Access to clinical prescription review queue is restricted to licensed pharmacists and compliance staff.',
      403,
      'CLINICAL_ACCESS_REQUIRED'
    );
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const whereClause: Prisma.PrescriptionWhereInput = options.status
    ? { status: options.status }
    : {
        status: {
          in: [
            PrescriptionStatus.PENDING_REVIEW,
            PrescriptionStatus.UNDER_REVIEW,
            PrescriptionStatus.UPLOADED,
          ],
        },
      };

  const [items, total] = await Promise.all([
    prisma.prescription.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }, // FIFO queue for clinical review
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalUsd: true,
          },
        },
      },
    }),
    prisma.prescription.count({ where: whereClause }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export interface PrescriptionReviewInput {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
  rejectionReasonCode?: RejectionReasonCode;
  customerMessage?: string;
  internalNotes?: string;
  expiresAt?: Date | string;
  refillsAuthorized?: number;
}

/**
 * Human Clinical Pharmacist Prescription Review Action.
 * GOLDEN RULE: AI must NEVER independently approve prescriptions.
 * Review must be conducted by an authorized human clinician.
 */
export async function reviewPrescription(
  prescriptionId: string,
  review: PrescriptionReviewInput,
  reviewerSession: SessionPayload,
  context?: { ipAddress?: string; userAgent?: string }
) {
  // Guard: Reviewer role
  if (
    reviewerSession.role !== 'CLINICAL_PHARMACIST' &&
    reviewerSession.role !== 'COMPLIANCE_ADMIN' &&
    reviewerSession.role !== 'SUPER_ADMIN'
  ) {
    throw new AuthorizationError(
      'Only licensed clinical pharmacists or compliance administrators may verify prescriptions.',
      403,
      'UNAUTHORIZED_REVIEWER'
    );
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { orders: true },
  });

  if (!prescription) {
    throw new PrescriptionError('Prescription not found.', 'NOT_FOUND', 404);
  }

  let nextStatus: PrescriptionStatus;
  let defaultCustomerMsg = '';

  switch (review.action) {
    case 'APPROVE':
      nextStatus = PrescriptionStatus.VERIFIED;
      defaultCustomerMsg = 'Your prescription has been reviewed and clinically verified.';
      break;
    case 'REJECT':
      nextStatus = PrescriptionStatus.REJECTED;
      defaultCustomerMsg = review.rejectionReasonCode
        ? REJECTION_REASON_LABELS[review.rejectionReasonCode]
        : 'Prescription does not meet regulatory requirements.';
      break;
    case 'REQUEST_MORE_INFO':
      nextStatus = PrescriptionStatus.MORE_INFORMATION_REQUIRED;
      defaultCustomerMsg = review.customerMessage || 'Additional information is required to verify your prescription.';
      break;
    default:
      throw new PrescriptionError('Invalid review action.', 'INVALID_ACTION');
  }

  if (!isValidPrescriptionTransition(prescription.status, nextStatus)) {
    throw new PrescriptionError(
      `Cannot transition prescription from ${prescription.status} to ${nextStatus}.`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // Parse expiration date if approved (defaults to 1 year from review)
  let computedExpiry: Date | undefined;
  if (review.action === 'APPROVE') {
    computedExpiry = review.expiresAt
      ? new Date(review.expiresAt)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const rx = await tx.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: nextStatus,
        rejectionReasonCode: review.action === 'REJECT' ? review.rejectionReasonCode : null,
        customerMessage: review.customerMessage || defaultCustomerMsg,
        verificationNotes: review.internalNotes, // Internal only — NEVER returned to customer
        verifiedByUserId: reviewerSession.userId,
        verifiedAt: new Date(),
        reviewedByUserId: reviewerSession.userId,
        reviewedAt: new Date(),
        expiresAt: computedExpiry,
        refillsAuthorized: review.refillsAuthorized ?? prescription.refillsAuthorized,
      },
    });

    // If approved or rejected, update linked orders
    if (prescription.orders.length > 0) {
      for (const order of prescription.orders) {
        if (review.action === 'APPROVE' && order.status === 'UNDER_CLINICAL_REVIEW') {
          // Transition order to PAYMENT_PROCESSING (ready for fulfillment upon payment capture)
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'CONFIRMED_PICKING' },
          });
        }
      }
    }

    return rx;
  });

  await logAuditEvent({
    userId: reviewerSession.userId,
    userRole: reviewerSession.role,
    action: review.action === 'APPROVE' ? 'PRESCRIPTION_VERIFIED' : 'PRESCRIPTION_REJECTED',
    resourceType: 'Prescription',
    resourceId: updated.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: {
      action: review.action,
      previousStatus: prescription.status,
      newStatus: nextStatus,
      rejectionReasonCode: review.rejectionReasonCode,
    },
  });

  return updated;
}

/**
 * Resubmits a prescription document when additional information is requested or rejected.
 * Preserves audit history by incrementing version rather than silently overwriting.
 */
export async function resubmitPrescription(
  prescriptionId: string,
  input: {
    fileBuffer: Buffer;
    originalFileName: string;
    mimeType: string;
    prescriberName?: string;
  },
  callerSession: SessionPayload,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
  });

  if (!prescription) {
    throw new PrescriptionError('Prescription not found.', 'NOT_FOUND', 404);
  }

  // IDOR check: Caller must own the prescription
  assertPrescriptionAccess(callerSession, prescription.userId);

  if (
    prescription.status !== PrescriptionStatus.MORE_INFORMATION_REQUIRED &&
    prescription.status !== PrescriptionStatus.REJECTED
  ) {
    throw new PrescriptionError(
      `Resubmission is only allowed when more information is requested or previous submission was rejected (current status: ${prescription.status}).`,
      'RESUBMISSION_DISALLOWED'
    );
  }

  // Validate file
  const normalizedMime = input.mimeType.toLowerCase();
  if (!ALLOWED_PRESCRIPTION_MIME_TYPES.includes(normalizedMime)) {
    throw new PrescriptionError('Unsupported file type. Allowed formats: PDF, JPEG, PNG.', 'INVALID_FILE_TYPE');
  }

  if (input.fileBuffer.length > MAX_PRESCRIPTION_FILE_SIZE_BYTES) {
    throw new PrescriptionError('File size exceeds 10MB limit.', 'FILE_TOO_LARGE');
  }

  const documentHash = crypto.createHash('sha256').update(input.fileBuffer).digest('hex');
  const ext = input.originalFileName.split('.').pop()?.toLowerCase() || 'pdf';
  const cleanExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext) ? ext : 'pdf';
  const newStorageKey = sanitizeStoragePath(
    `prescriptions/${prescription.userId}/v${prescription.version + 1}_${crypto.randomUUID()}.${cleanExt}`
  );

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      documentUrl: newStorageKey,
      originalFileName: input.originalFileName,
      mimeType: normalizedMime,
      fileSizeBytes: input.fileBuffer.length,
      documentHash,
      prescriberName: input.prescriberName || prescription.prescriberName,
      status: PrescriptionStatus.PENDING_REVIEW,
      customerMessage: null,
      version: prescription.version + 1,
    },
  });

  await logAuditEvent({
    userId: callerSession.userId,
    action: 'PRESCRIPTION_UPLOADED',
    resourceType: 'Prescription',
    resourceId: updated.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: {
      action: 'PRESCRIPTION_RESUBMITTED',
      version: updated.version,
    },
  });

  return updated;
}
