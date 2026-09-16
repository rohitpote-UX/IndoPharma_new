/**
 * ==============================================================================
 * INDOPHARM — PRIVACY-PRESERVING ANALYTICS ABSTRACTION
 * ==============================================================================
 * Emits non-ePHI analytics events.
 * NEVER tracks personal health details, prescription documents, or patient PII.
 * ==============================================================================
 */

export interface TelemetryEvent {
  name:
    | 'catalog_viewed'
    | 'product_details_opened'
    | 'provenance_inspected'
    | 'landed_cost_expanded'
    | 'prescription_upload_initiated'
    | 'checkout_started'
    | 'compliance_notice_viewed';
  properties?: Record<string, string | number | boolean>;
}

export function trackTelemetryEvent(event: TelemetryEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Telemetry] ${event.name}`, event.properties);
  }
  // Production analytics pipeline (e.g. PostHog / Plausible / Cloudflare)
}
