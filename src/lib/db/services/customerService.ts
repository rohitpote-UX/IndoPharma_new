/**
 * ==============================================================================
 * INDOPHARM — CUSTOMER & PROFILE DOMAIN SERVICE
 * ==============================================================================
 * Manages Customer profiles, address books, and support ticket creation.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { CustomerType, TicketPriority } from '@prisma/client';

export interface CustomerProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  customerType: CustomerType;
  companyName?: string | null;
  defaultCountryCode?: string;
  isVerified: boolean;
}

/**
 * Resolves or creates a Customer business profile for an authenticated User.
 */
export async function getOrCreateCustomer(
  userId: string,
  defaults?: {
    customerType?: CustomerType;
    companyName?: string;
    defaultCountryId?: string;
  },
  client: typeof prisma = prisma
): Promise<CustomerProfile> {
  let customer = await client.customer.findUnique({
    where: { userId },
    include: {
      user: true,
      defaultCountry: true,
    },
  });

  if (!customer) {
    const user = await client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User ${userId} not found.`);
    }

    customer = await client.customer.create({
      data: {
        userId,
        customerType: defaults?.customerType ?? CustomerType.INDIVIDUAL,
        companyName: defaults?.companyName,
        defaultCountryId: defaults?.defaultCountryId,
      },
      include: {
        user: true,
        defaultCountry: true,
      },
    });
  }

  return {
    id: customer.id,
    userId: customer.userId,
    email: customer.user.email,
    firstName: customer.user.firstName,
    lastName: customer.user.lastName,
    customerType: customer.customerType,
    companyName: customer.companyName,
    defaultCountryCode: customer.defaultCountry?.code,
    isVerified: customer.isVerified,
  };
}

/**
 * Creates a Customer Support Ticket.
 */
export async function createSupportTicket(
  input: {
    customerId: string;
    orderId?: string;
    subject: string;
    description: string;
    priority?: TicketPriority;
  },
  client: typeof prisma = prisma
) {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `TICK-${Date.now().toString().slice(-6)}-${randomCode}`;

  return await client.supportTicket.create({
    data: {
      ticketNumber,
      customerId: input.customerId,
      orderId: input.orderId,
      subject: input.subject,
      description: input.description,
      priority: input.priority ?? TicketPriority.MEDIUM,
      status: 'OPEN',
    },
  });
}
