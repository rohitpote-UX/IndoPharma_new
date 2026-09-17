'use strict';

import React from 'react';
import { ProductDocument } from '@/lib/domain/product';
import { FileText, Download, ShieldCheck, AlertCircle } from 'lucide-react';

interface ProductDocumentsProps {
  documents: ProductDocument[];
}

export const ProductDocuments: React.FC<ProductDocumentsProps> = ({ documents }) => {
  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-[#111411]">
            Quality & Documentation
          </h3>
          <p className="text-xs text-[#59605A] mt-0.5">
            Independently reviewed batch documentation and regulatory clearances.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#2F5D3A] bg-[#F3F7F3] px-2.5 py-1 rounded-full border border-[#2F5D3A]/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Authentic Audited Records
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-neutral-50 rounded-lg p-6 text-center border border-dashed border-[#E6ECE7]">
          <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-[#59605A] font-medium">
            Documentation will be displayed here when available.
          </p>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Batch-specific Certificates of Analysis (CoA) are uploaded upon quarantine release by our QA team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {documents.map((doc) => {
            const isDownloadable = Boolean(doc.fileUrl && doc.fileUrl.startsWith('/docs/'));

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#E6ECE7] hover:border-[#2F5D3A]/40 transition-colors bg-white"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#111411] truncate">
                      {doc.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#59605A] mt-0.5">
                      <span className="font-mono uppercase">{doc.type}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">
                        {doc.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {isDownloadable ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[#2F5D3A] hover:bg-[#F3F7F3] transition-colors shrink-0"
                    aria-label={`Download ${doc.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-[11px] text-neutral-400 shrink-0 italic">
                    On file
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-2 border-t border-neutral-100">
        <AlertCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        Zero fabricated certificates. IndoPharm only presents verified records provided directly by licensed manufacturing QA laboratories.
      </div>
    </div>
  );
};
