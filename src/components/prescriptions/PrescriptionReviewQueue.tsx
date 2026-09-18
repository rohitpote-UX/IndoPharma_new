'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Eye, ShieldCheck, Clock, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PendingPrescription {
  id: string;
  patientName: string | null;
  prescriberName: string | null;
  prescriberLicense: string | null;
  originalFileName: string | null;
  documentHash: string | null;
  version: number;
  status: string;
  createdAt: string;
  customer?: {
    user: {
      email: string;
    };
  };
}

export function PrescriptionReviewQueue() {
  const [prescriptions, setPrescriptions] = useState<PendingPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRx, setSelectedRx] = useState<PendingPrescription | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('UNREADABLE_SCAN');
  const [customerMessage, setCustomerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/prescriptions?limit=25');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch review queue');
      setPrescriptions(data.prescriptions || []);
    } catch (err: any) {
      setError(err.message || 'Error loading clinical queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openDocumentPreview = async (rx: PendingPrescription) => {
    try {
      setSelectedRx(rx);
      setPreviewUrl(null);
      const res = await fetch(`/api/prescriptions/${rx.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch signed document URL');
      setPreviewUrl(data.prescription.downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Could not load prescription document.');
    }
  };

  const handleDecision = async () => {
    if (!selectedRx || !actionType) return;

    try {
      setSubmitting(true);
      const statusMap = {
        APPROVE: 'APPROVED',
        REJECT: 'REJECTED',
        REQUEST_INFO: 'MORE_INFORMATION_REQUIRED',
      };

      const payload: Record<string, any> = {
        decision: statusMap[actionType],
        notes: notes || 'Reviewed by Clinical Pharmacist',
      };

      if (actionType === 'REJECT') {
        payload.rejectionReason = rejectionReason;
        payload.customerMessage = customerMessage || 'Document does not meet clinical requirements.';
      } else if (actionType === 'REQUEST_INFO') {
        payload.customerMessage = customerMessage || 'Please upload a clearer image of your prescription.';
      }

      const res = await fetch(`/api/prescriptions/${selectedRx.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review decision failed.');

      setSelectedRx(null);
      setActionType(null);
      setNotes('');
      setCustomerMessage('');
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Error submitting review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6ECE7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2F5D3A]" />
            <h2 className="text-lg font-bold text-[#111411]">Clinical Verification Authority Queue</h2>
          </div>
          <p className="text-xs text-[#59605A] mt-0.5">
            Strict human verification required under CDSCO & FDA Personal Importation guidelines.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchQueue}
          disabled={loading}
          className="flex items-center gap-1 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FFF1F0] border border-[#FFCCC7] text-xs text-[#CF1322] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#59605A] space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2F5D3A]" />
          <p className="text-xs">Loading pending prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="py-12 text-center text-[#59605A] space-y-2">
          <CheckCircle2 className="h-8 w-8 text-[#2F5D3A] mx-auto" />
          <p className="text-sm font-semibold text-[#111411]">Prescription Queue Clean</p>
          <p className="text-xs">All submitted customer prescriptions have been reviewed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE7] text-[#848D85] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Patient / Customer</th>
                <th className="pb-3">Prescriber Info</th>
                <th className="pb-3">Version / Hash</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE7]">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-[#F9FAF8] transition">
                  <td className="py-3 pl-2">
                    <div className="font-semibold text-[#111411]">{rx.patientName || 'Patient On File'}</div>
                    <div className="text-[11px] text-[#59605A]">{rx.customer?.user?.email || 'N/A'}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-[#111411] font-medium">{rx.prescriberName || 'Unspecified'}</div>
                    <div className="text-[11px] text-[#848D85]">{rx.prescriberLicense || 'No NPI/License'}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-mono text-[10px] text-[#2F5D3A] font-bold">v{rx.version}</div>
                    <div className="font-mono text-[9px] text-[#848D85] truncate max-w-[120px]">
                      {rx.documentHash ? rx.documentHash.substring(0, 16) + '...' : 'pending hash'}
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        rx.status === 'APPROVED' || rx.status === 'VERIFIED'
                          ? 'green'
                          : rx.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {rx.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDocumentPreview(rx)}
                      className="text-xs h-7 px-2.5"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E6ECE7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block">
                  Prescription #{selectedRx.id.substring(0, 8)} • v{selectedRx.version}
                </span>
                <h3 className="text-base font-bold text-[#111411]">
                  Clinical Audit for {selectedRx.patientName || 'Registered Patient'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRx(null);
                  setActionType(null);
                }}
                className="text-[#848D85] hover:text-[#111411] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Viewer Frame */}
            <div className="bg-[#FAFBF9] rounded-xl border border-[#CBD7CE] p-4 text-center min-h-[220px] flex items-center justify-center">
              {previewUrl ? (
                <div className="w-full space-y-3">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D3A] text-white rounded-lg text-xs font-semibold hover:bg-[#254A2E]"
                  >
                    <Eye className="h-4 w-4" />
                    Open Private Document in Secure Viewer
                  </a>
                  <p className="text-[10px] text-[#848D85]">
                    URL signed with HMAC-SHA256 • Expires in 15 minutes
                  </p>
                </div>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-[#2F5D3A]" />
              )}
            </div>

            {/* Decision Selector */}
            {!actionType ? (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Button
                  onClick={() => setActionType('APPROVE')}
                  className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs h-10"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Approve Rx
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActionType('REQUEST_INFO')}
                  className="border-[#D48806] text-[#D48806] hover:bg-[#FFFBE6] text-xs h-10"
                >
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  Request Info
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActionType('REJECT')}
                  className="border-[#CF1322] text-[#CF1322] hover:bg-[#FFF1F0] text-xs h-10"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject Rx
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-[#E6ECE7]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111411]">
                    Action: <span className="text-[#2F5D3A]">{actionType}</span>
                  </span>
                  <button
                    onClick={() => setActionType(null)}
                    className="text-[11px] text-[#848D85] hover:underline cursor-pointer"
                  >
                    Change Action
                  </button>
                </div>

                {actionType === 'REJECT' && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#111411] mb-1">
                      Rejection Reason Code
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A]"
                    >
                      <option value="UNREADABLE_SCAN">Unreadable / Blurred Document</option>
                      <option value="EXPIRED_PRESCRIPTION">Expired Prescription Date</option>
                      <option value="UNAUTHORIZED_PRESCRIBER">Unverified Prescriber License</option>
                      <option value="SCHEDULED_SUBSTANCE_PROHIBITED">Prohibited Controlled Substance</option>
                      <option value="FORGED_DOCUMENT">Suspected Fraudulent Document</option>
                      <option value="OTHER">Other Clinical Reason</option>
                    </select>
                  </div>
                )}

                {(actionType === 'REJECT' || actionType === 'REQUEST_INFO') && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#111411] mb-1">
                      Patient Notification Message
                    </label>
                    <input
                      type="text"
                      placeholder="Explain to patient what needs correction..."
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-[#111411] mb-1">
                    Internal Pharmacist Audit Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Document clinical check notes for regulatory compliance..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActionType(null)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDecision}
                    disabled={submitting}
                    className="bg-[#2F5D3A] text-white hover:bg-[#254A2E]"
                  >
                    {submitting ? 'Recording Audit...' : 'Confirm Clinical Decision'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
