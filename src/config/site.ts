/**
 * ==============================================================================
 * INDOPHARM — SITE CONFIGURATION & COMPLIANCE STATEMENTS
 * ==============================================================================
 * Central configuration holding navigation, metadata, and strict compliance
 * disclaimers. Contains NO UNSUPPORTED CLAIMS.
 * ==============================================================================
 */

export const siteConfig = {
  name: 'IndoPharm',
  shortDescription:
    'Direct India → USA pharmaceutical commerce platform engineered for verifiable sourcing, price transparency, and chronic patient access.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://indopharm.com',
  ogImage: '/images/og-image.png',
  support: {
    email: 'care@indopharm.com',
    pharmacistHotline: '1-800-555-INDO (4636)',
    hours: 'Mon-Fri 8:00 AM – 8:00 PM EST',
  },
  nav: [
    { label: 'Browse Medications', href: '/#catalog' },
    { label: 'Sourcing & Provenance', href: '/#provenance' },
    { label: 'Landed-Cost Model', href: '/#pricing-transparency' },
    { label: 'Compliance & FAQ', href: '/#regulatory-notice' },
  ],
  disclaimers: {
    regulatoryNotice:
      'IndoPharm facilitates the lawful personal importation of non-controlled chronic maintenance medications in compliance with FDA Personal Importation Policy (CPG Sec. 110.300) and applicable U.S. federal guidelines. A valid, unexpired prescription issued by a licensed U.S. healthcare practitioner is strictly required for all prescription products.',
    controlledSubstancesBan:
      'IndoPharm does not sell, ship, or facilitate the transfer of any DEA Schedule II, III, IV, or V controlled substances. All controlled medications are strictly barred from our platform.',
    medicalAdvice:
      'Information provided on this platform is for educational and informational purposes only and does not substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition.',
    deliveryTimeline:
      'Standard cross-border international transit from verified Indian manufacturing hubs to U.S. residential addresses typically requires 10 to 14 business days, subject to U.S. Customs & Border Protection inspection and carrier processing.',
  },
};
