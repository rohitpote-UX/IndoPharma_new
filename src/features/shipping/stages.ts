/**
 * ==============================================================================
 * INDOPHARM — 8-STAGE CROSS-BORDER TRACKING DEFINITIONS
 * ==============================================================================
 * Clear visual progression of an order from Indian factory release to
 * U.S. patient doorstep.
 * ==============================================================================
 */

export interface TrackingStageDefinition {
  id: number;
  code: string;
  title: string;
  description: string;
  locationScope: 'INDIA' | 'TRANSIT' | 'USA';
}

export const CROSS_BORDER_STAGES: TrackingStageDefinition[] = [
  {
    id: 1,
    code: 'ORDER_PLACED',
    title: 'Order Placed & Presigned',
    description: 'Patient order registered and payment intent authorized on hold.',
    locationScope: 'USA',
  },
  {
    id: 2,
    code: 'CLINICAL_VERIFIED',
    title: 'Prescription Verified',
    description: 'Licensed clinical pharmacist validated prescriber NPI and dosage safety.',
    locationScope: 'USA',
  },
  {
    id: 3,
    code: 'INDIA_BATCH_PICKED',
    title: 'Batch Picked & Sealed',
    description: 'Verified lot picked at Indian bonded hub with Certificate of Analysis scan.',
    locationScope: 'INDIA',
  },
  {
    id: 4,
    code: 'EXPORT_CUSTOMS_CLEARED',
    title: 'Indian Customs Export Clearance',
    description: 'Commercial invoice and CDSCO export documentation inspected and passed.',
    locationScope: 'INDIA',
  },
  {
    id: 5,
    code: 'INTERNATIONAL_AIR_TRANSIT',
    title: 'International Bonded Air Express',
    description: 'Temperature-monitored international flight en route to U.S. Port of Entry.',
    locationScope: 'TRANSIT',
  },
  {
    id: 6,
    code: 'US_CUSTOMS_CLEARANCE',
    title: 'U.S. Port of Entry & FDA Clearance',
    description: 'Import clearance processed under FDA Personal Importation guidelines.',
    locationScope: 'USA',
  },
  {
    id: 7,
    code: 'DOMESTIC_OUT_FOR_DELIVERY',
    title: 'Domestic Carrier Handoff',
    description: 'Package accepted by domestic priority courier for final-mile dispatch.',
    locationScope: 'USA',
  },
  {
    id: 8,
    code: 'DELIVERED',
    title: 'Delivered to Patient',
    description: 'Successfully received at patient residential address with delivery confirmation.',
    locationScope: 'USA',
  },
];
