/**
 * ==============================================================================
 * INDOPHARM — ZOD INPUT VALIDATION SCHEMAS
 * ==============================================================================
 * Enforces strict validation on patient submissions, prescriptions, and orders.
 * ==============================================================================
 */

import { z } from 'zod';

export const prescriptionUploadSchema = z.object({
  prescriberName: z.string().min(2, 'Prescriber name is required'),
  prescriberNpi: z
    .string()
    .length(10, 'NPI must be a 10-digit number')
    .regex(/^\d+$/, 'NPI must contain digits only'),
  prescriberState: z.string().length(2, 'State must be a 2-letter postal code'),
  documentUrl: z.string().min(1, 'Prescription document is required'),
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter abbreviation'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid U.S. ZIP code required'),
  country: z.literal('US'),
});

export const orderCreationSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(2, 'Max 2 packages (180-day personal use cap)'),
  shippingAddress: shippingAddressSchema,
  prescriptionId: z.string().min(1, 'Prescription record is required'),
});
