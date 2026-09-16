import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FinalCta() {
  return (
    <section className="bg-white py-24 sm:py-32 lg:py-40 border-b border-[#E6ECE7]">
      <Container>
        <div className="mx-auto max-w-3xl text-center space-y-8 sm:space-y-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Direct Access
          </span>

          <h2 className="text-[clamp(2.5rem,5vw,4.25rem)] font-bold tracking-tight text-[#111411] leading-[1.08]">
            Find a simpler way to explore <span className="text-[#2F5D3A]">pharmaceutical value.</span>
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-[#59605A] max-w-xl mx-auto font-normal leading-relaxed">
            Essential chronic maintenance therapies. Direct verified manufacturer sourcing,
            serialized batches, and reliable delivery.
          </p>

          <div className="pt-2">
            <Link
              href="/medicines"
              className="group inline-flex h-[52px] sm:h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[#2F5D3A] px-8 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-[#24482D] hover:shadow-md cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#2F5D3A]"
            >
              <span>Explore Medicines</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
