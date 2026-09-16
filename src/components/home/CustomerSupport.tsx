import React from 'react';
import { PhoneCall, Mail, HelpCircle, Package, CreditCard, FileQuestion, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export function CustomerSupport() {
  const supportCategories = [
    {
      title: 'Order Status & Tracking',
      icon: Package,
      description: 'Check live transit milestones, customs status, and delivery estimates.',
    },
    {
      title: 'Prescription Inquiries',
      icon: FileQuestion,
      description: 'Requirements for U.S. physician prescriptions, NPI validation, and refills.',
    },
    {
      title: 'Shipping & International Transit',
      icon: HelpCircle,
      description: 'Details on temperature monitoring, bonded air cargo, and U.S. customs entry.',
    },
    {
      title: 'Payment & Landed Billing',
      icon: CreditCard,
      description: 'Questions regarding authorization holds, refunds, and transparent cost itemization.',
    },
  ];

  return (
    <section id="support" className="py-20 sm:py-32 border-b border-[#E4E7DC]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 5 Columns: Lead & Hotline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
              09 • Clinical & Order Support
            </div>
            <h2 className="text-section-title text-[#171914]">
              Questions shouldn&apos;t become obstacles.
            </h2>
            <p className="text-editorial-lead text-[#52564C]">
              Whether you need to speak directly with a licensed clinical pharmacist regarding
              drug interactions or want to check your shipment milestone, our team is directly accessible.
            </p>

            <div className="rounded-2xl border border-[#D1D6C5] bg-[#EEF1E6] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#596B3A]">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#43522B] uppercase tracking-wider">
                    Pharmacist Consultation Line
                  </div>
                  <a
                    href="tel:1-800-555-4636"
                    className="text-lg sm:text-xl font-bold font-mono text-[#171914] hover:text-[#43522B] transition-colors"
                  >
                    1-800-555-INDO (4636)
                  </a>
                </div>
              </div>
              <p className="text-xs text-[#52564C] leading-relaxed">
                Licensed clinical pharmacists available Mon–Fri, 8:00 AM – 8:00 PM EST.
                For clinical guidance, dosage safety, and prescription transfers.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#52564C]">
              <Mail className="h-4 w-4 text-[#596B3A]" />
              <span>Direct Email: <strong>care@indopharm.com</strong></span>
            </div>
          </div>

          {/* Right 7 Columns: Support Category Tiles */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportCategories.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#E4E7DC] bg-white p-6 space-y-3 shadow-2xs hover:border-[#D1D6C5] transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] text-[#596B3A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#171914]">{item.title}</h3>
                  <p className="text-xs text-[#52564C] leading-relaxed">{item.description}</p>
                </div>
              );
            })}

            <div className="sm:col-span-2 rounded-2xl border border-[#E4E7DC] bg-[#FAFAF7] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#52564C]">
                <strong className="text-[#171914] block">Need assistance with a prescription transfer?</strong>
                Our clinical support team coordinates directly with your U.S. physician.
              </div>
              <Button variant="secondary" size="sm" className="shrink-0 w-full sm:w-auto">
                <span>Visit Help Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
