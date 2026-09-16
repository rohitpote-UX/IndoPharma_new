/**
 * ==============================================================================
 * INDOPHARM — SHIPPING & LOGISTICS ABSTRACTIONS
 * ==============================================================================
 */

import { ShipmentStage } from '@/types';

export interface CarrierMilestone {
  stage: ShipmentStage;
  location: string;
  timestamp: Date;
  statusDetails: string;
}

export interface InternationalShipmentManifest {
  manifestId: string;
  orderNumber: string;
  carrier: 'DHL_EXPRESS' | 'FEDEX_CROSSBORDER' | 'USPS';
  trackingNumber: string;
  originHub: 'BOM_BONDED_AIR' | 'DEL_BONDED_AIR';
  usPortOfEntry: 'JFK' | 'ORD' | 'LAX';
  isSection321Eligible: boolean;
  maxPersonalImportSupplyDays: 90;
}
