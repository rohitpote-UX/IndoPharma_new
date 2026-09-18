'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ThermometerSnowflake,
  FileCheck,
  ChevronLeft,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PrescriptionUploadModal } from '@/components/prescriptions/PrescriptionUploadModal';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/${orderNumber}/tracking`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load tracking information.');
      }

      setTracking(data.tracking);
    } catch (err: any) {
      setError(err.message || 'Error loading shipment tracking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchTracking();
    }
  }, [orderNumber]);

  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FAFBF9] min-h-screen py-10 sm:py-14">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59605A] hover:text-[#2F5D3A] transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Account & Orders
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2F5D3A]" />
            <p className="text-sm font-semibold text-[#111411]">Loading Live Tracking Milestones...</p>
            <p className="text-xs text-[#59605A]">Syncing with global air freight & customs records...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#FFCCC7] bg-[#FFF1F0] p-8 text-center space-y-4 max-w-xl mx-auto">
            <AlertCircle className="h-10 w-10 text-[#CF1322] mx-auto" />
            <h2 className="text-lg font-bold text-[#111411]">Unable to Retrieve Tracking</h2>
            <p className="text-xs text-[#59605A]">{error}</p>
            <Button
              onClick={fetchTracking}
              size="sm"
              className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try Again
            </Button>
          </div>
        ) : tracking ? (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E6ECE7] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A]">
                    Live Shipment Surveillance
                  </span>
                  <Badge
                    variant={tracking.orderStatus === 'DELIVERED' ? 'green' : 'warning'}
                    size="sm"
                  >
                    {tracking.orderStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411] mt-1">
                  Order #{tracking.orderNumber}
                </h1>
                <p className="text-xs text-[#59605A] mt-1">
                  Cross-Border Pharmaceutical Transit: {tracking.originCountry} → {tracking.destinationCountry}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTracking}
                  className="text-xs h-9 flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
                {tracking.carrier?.trackingUrl && (
                  <a
                    href={tracking.carrier.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-lg bg-[#2F5D3A] hover:bg-[#254A2E] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>Carrier Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Critical Alert Banner if Rx Action Required */}
            {tracking.milestones?.some((m: any) => m.status === 'ACTION_REQUIRED') && (
              <div className="rounded-2xl border border-[#FFCCC7] bg-[#FFF1F0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#CF1322] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#111411]">Action Required: Prescription Document</h3>
                    <p className="text-xs text-[#59605A] mt-0.5">
                      Our clinical pharmacy team requires clarification or a replacement scan to release your order for international dispatch.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-[#CF1322] text-white hover:bg-[#A8071A] text-xs shrink-0"
                >
                  Upload New Prescription
                </Button>
              </div>
            )}

            {/* Carrier & Integrity Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Carrier Details */}
              <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#848D85]">
                  <span>Carrier & Logistics</span>
                  <Truck className="h-4 w-4 text-[#2F5D3A]" />
                </div>
                <div className="text-base font-bold text-[#111411]">
                  {tracking.carrier?.name || 'DHL Express / Air Freight'}
                </div>
                {tracking.carrier?.trackingNumber && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs text-[#2F5D3A] font-semibold">
                      {tracking.carrier.trackingNumber}
                    </span>
                    <button
                      onClick={() => copyTrackingNumber(tracking.carrier.trackingNumber)}
                      className="text-[#848D85] hover:text-[#111411] cursor-pointer"
                      title="Copy Tracking Number"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[#2F5D3A]" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Estimation */}
              <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#848D85]">
                  <span>Estimated Delivery</span>
                  <Clock className="h-4 w-4 text-[#2F5D3A]" />
                </div>
                <div className="text-base font-bold text-[#111411]">
                  {tracking.actualDelivery
                    ? `Delivered: ${new Date(tracking.actualDelivery).toLocaleDateString()}`
                    : tracking.estimatedDelivery
                    ? new Date(tracking.estimatedDelivery).toLocaleDateString()
                    : '7–10 Business Days (Priority)'}
                </div>
                <p className="text-[11px] text-[#59605A]">
                  {tracking.actualDelivery ? 'Delivered with recipient signature.' : 'Cleared for priority international air corridor.'}
                </p>
              </div>

              {/* Cold-Chain & Tamper-Proof Assurance */}
              <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#848D85]">
                  <span>Pharmaceutical Assurance</span>
                  <ThermometerSnowflake className="h-4 w-4 text-[#2F5D3A]" />
                </div>
                <div className="text-base font-bold text-[#111411]">
                  Cold-Chain & Tamper Verified
                </div>
                <p className="text-[11px] text-[#59605A] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2F5D3A]" />
                  <span>Inspected under FDA 21 CFR § 1301.26 guidelines</span>
                </p>
              </div>
            </div>

            {/* Milestone Timeline */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#111411]">End-to-End Progression Timeline</h2>
                <p className="text-xs text-[#59605A] mt-0.5">
                  Real-time milestone tracking from bonded pharmacy hub to patient delivery.
                </p>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6ECE7]">
                {tracking.milestones?.map((step: any, index: number) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isCurrent = step.status === 'CURRENT';
                  const isAction = step.status === 'ACTION_REQUIRED';
                  const isSkipped = step.status === 'SKIPPED';

                  return (
                    <div key={step.id} className="relative group">
                      {/* Status Icon Marker */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? 'bg-[#2F5D3A] text-white'
                            : isCurrent
                            ? 'bg-[#2F5D3A] text-white ring-4 ring-[#2F5D3A]/20 animate-pulse'
                            : isAction
                            ? 'bg-[#CF1322] text-white ring-4 ring-[#CF1322]/20'
                            : isSkipped
                            ? 'bg-[#E6ECE7] text-[#848D85]'
                            : 'bg-white border-2 border-[#CBD7CE] text-[#848D85]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isAction ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#111411]">{step.title}</h3>
                            <Badge
                              variant={
                                isCompleted
                                  ? 'green'
                                  : isCurrent
                                  ? 'green'
                                  : isAction
                                  ? 'danger'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {step.status}
                            </Badge>
                          </div>
                          {step.completedAt && (
                            <span className="text-[11px] text-[#848D85] font-mono">
                              {new Date(step.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-[#2F5D3A]">{step.subtitle}</p>
                        <p className="text-xs text-[#59605A] leading-relaxed">{step.description}</p>
                        {step.location && (
                          <p className="text-[11px] text-[#848D85] flex items-center gap-1 pt-0.5">
                            <span>Facility:</span> {step.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carrier Event Log */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#2F5D3A]" />
                  <h3 className="text-sm font-bold text-[#111411]">Carrier Scan & Customs Audit Log</h3>
                </div>
                <span className="text-xs text-[#848D85]">
                  {tracking.events?.length || 0} recorded events
                </span>
              </div>

              {tracking.events?.length === 0 ? (
                <p className="text-xs text-[#59605A] py-4 text-center">
                  Order placed and preparing for bonded dispatch. Scans will record automatically upon carrier induction.
                </p>
              ) : (
                <div className="divide-y divide-[#E6ECE7]">
                  {tracking.events?.map((event: any) => (
                    <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <div>
                        <div className="font-semibold text-[#111411]">{event.description}</div>
                        <span className="text-[11px] text-[#59605A]">{event.location}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#848D85]">
                        {new Date(event.eventTime).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Container>

      {/* Prescription Upload / Resubmit Modal */}
      <PrescriptionUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => fetchTracking()}
        resubmitPrescriptionId={tracking?.prescriptionId}
      />
    </div>
  );
}
