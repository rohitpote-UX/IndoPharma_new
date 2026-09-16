import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { User, FileText, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'My Account | IndoPharm',
  description: 'Manage your verified maintenance prescriptions, active refills, and delivery tracking.',
};

export default function AccountPage() {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Patient Portal
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            My Account
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Manage your chronic maintenance refills, verified physician prescriptions on file, and active deliveries.
          </p>
        </div>

        {/* Portal Dashboard Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Profile Summary (4 Columns) */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E6ECE7] bg-[#F3F7F3] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-white border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shadow-xs">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111411]">Demo Patient Profile</h2>
                <span className="text-xs text-[#59605A]">patient@example.com</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6ECE7] space-y-3 text-xs text-[#59605A]">
              <div className="flex items-center justify-between">
                <span>Account Status:</span>
                <Badge variant="green" size="sm">Verified Patient</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Prescriptions:</span>
                <span className="font-bold text-[#111411]">2 Approved</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Destination:</span>
                <span className="text-[#111411]">California, United States</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#848D85] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2F5D3A]" />
              <span>HIPAA-Compliant Encrypted Storage</span>
            </div>
          </div>

          {/* Right Column: Prescriptions & Recent Orders (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Refills Card */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 sm:p-8 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-base text-[#111411]">
                  <FileText className="h-5 w-5 text-[#2F5D3A]" />
                  <span>Prescriptions on File</span>
                </div>
                <Badge variant="green" size="sm">2 Active</Badge>
              </div>

              <div className="divide-y divide-[#E6ECE7] text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <strong className="text-[#111411] block text-sm">Atorvastatin Calcium 20mg</strong>
                    <span className="text-[#59605A]">Prescribing MD: Dr. S. Miller • Refills Left: 3</span>
                  </div>
                  <Link
                    href="/medicines/atorvastatin-calcium-20mg"
                    className="h-8 px-3 rounded-lg border border-[#E6ECE7] bg-white hover:bg-[#F3F7F3] text-[11px] font-semibold text-[#2F5D3A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reorder</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <strong className="text-[#111411] block text-sm">Metformin HCl ER 500mg</strong>
                    <span className="text-[#59605A]">Prescribing MD: Dr. S. Miller • Refills Left: 2</span>
                  </div>
                  <Link
                    href="/medicines/metformin-hcl-500mg-er"
                    className="h-8 px-3 rounded-lg border border-[#E6ECE7] bg-white hover:bg-[#F3F7F3] text-[11px] font-semibold text-[#2F5D3A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reorder</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Order History Card */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 sm:p-8 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-base text-[#111411]">
                  <Package className="h-5 w-5 text-[#2F5D3A]" />
                  <span>Recent International Shipments</span>
                </div>
                <Link href="/help/shipping" className="text-xs font-semibold text-[#2F5D3A] hover:underline">
                  Shipping FAQ →
                </Link>
              </div>

              <div className="rounded-xl border border-[#E6ECE7] p-4 bg-[#F3F7F3] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#111411]">ORD-2026-US-8819</span>
                  <Badge variant="green" size="sm">Delivered</Badge>
                </div>
                <div className="text-[#59605A]">90-Day Supply: Atorvastatin 20mg ($29.50)</div>
                <div className="text-[#848D85] text-[11px]">
                  Bonded Air Cargo • Delivered via USPS Ground in California
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
