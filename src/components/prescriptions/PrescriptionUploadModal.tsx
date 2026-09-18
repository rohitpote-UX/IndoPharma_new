'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  resubmitPrescriptionId?: string; // If resubmitting an existing prescription
}

export function PrescriptionUploadModal({
  isOpen,
  onClose,
  onSuccess,
  resubmitPrescriptionId,
}: PrescriptionUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prescriberName, setPrescriberName] = useState('');
  const [prescriberLicense, setPrescriberLicense] = useState('');
  const [prescriberClinic, setPrescriberClinic] = useState('');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (10MB max)
    if (selected.size > 10 * 1024 * 1024) {
      setError('Document exceeds the 10MB maximum file size limit.');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setError('Invalid format. Only PDF, JPG, PNG, and WebP medical records are accepted.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a prescription document to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (prescriberName) formData.append('prescriberName', prescriberName);
      if (prescriberLicense) formData.append('prescriberLicense', prescriberLicense);
      if (prescriberClinic) formData.append('prescriberClinic', prescriberClinic);
      if (patientName) formData.append('patientName', patientName);
      if (notes) formData.append('notes', notes);

      const endpoint = resubmitPrescriptionId
        ? `/api/prescriptions/${resubmitPrescriptionId}/resubmit`
        : '/api/prescriptions/upload';

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit prescription.');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setFile(null);
        setPreviewUrl(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during secure document upload.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E6ECE7] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 text-[#848D85] hover:text-[#111411] transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F5D3A] block">
            {resubmitPrescriptionId ? 'Clinical Resubmission' : 'Secure ePHI Ingestion'}
          </span>
          <h3 className="text-xl font-bold text-[#111411]">
            {resubmitPrescriptionId ? 'Resubmit Prescription Document' : 'Upload Doctor Prescription'}
          </h3>
          <p className="text-xs text-[#59605A] mt-1">
            Documents are encrypted at rest with AES-256 and reviewed strictly by licensed pharmacists.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFF1F0] border border-[#FFCCC7] flex items-center gap-2 text-xs text-[#CF1322]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-[#2F5D3A] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-[#111411]">Prescription Uploaded Successfully</h4>
            <p className="text-xs text-[#59605A]">
              Queued for human verification by clinical pharmacy staff.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                file
                  ? 'border-[#2F5D3A] bg-[#F3F7F3]'
                  : 'border-[#CBD7CE] hover:border-[#2F5D3A] bg-[#FAFBF9]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 text-[#2F5D3A] mx-auto" />
                  <p className="text-xs font-bold text-[#111411] truncate">{file.name}</p>
                  <span className="text-[10px] text-[#59605A]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                  </span>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Prescription preview"
                      className="mt-2 max-h-32 rounded-lg mx-auto border border-[#E6ECE7] object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-[#848D85] mx-auto" />
                  <p className="text-xs font-medium text-[#111411]">
                    Click or drag prescription scan or photo
                  </p>
                  <p className="text-[10px] text-[#848D85]">
                    PDF, JPG, PNG or WebP (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Optional Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-[#111411] mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Robert Vance, MD"
                  value={prescriberName}
                  onChange={(e) => setPrescriberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#111411] mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Health Center"
                  value={prescriberClinic}
                  onChange={(e) => setPrescriberClinic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#111411] mb-1">Doctor NPI / License #</label>
                <input
                  type="text"
                  placeholder="e.g. NPI 1234567890"
                  value={prescriberLicense}
                  onChange={(e) => setPrescriberLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#111411] mb-1">Patient Full Name</label>
                <input
                  type="text"
                  placeholder="Name as printed on Rx"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-medium text-[#111411] mb-1">
                Special Instructions / Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Dosage directions or clarification notes for reviewing pharmacist..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-[#848D85]">
              <div className="flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-[#2F5D3A]" />
                <span>ePHI Tamper Protection Active</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!file || submitting}
                  className="bg-[#2F5D3A] text-white hover:bg-[#254A2E]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Encrypting & Uploading...
                    </span>
                  ) : (
                    'Submit for Review'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
