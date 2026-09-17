import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getProductPassport, VERIFIED_PRODUCTS_STORE } from '@/lib/services/searchService';
import { ProductPassport } from '@/components/pharmacy/ProductPassport';
import { Container } from '@/components/ui/Container';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ destination?: string }>;
}

export async function generateStaticParams() {
  return VERIFIED_PRODUCTS_STORE.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { destination = 'US' } = await searchParams;
  const passport = await getProductPassport(slug, destination);

  if (!passport) {
    return {
      title: 'Product Passport Not Found | IndoPharm',
    };
  }

  return {
    title: `Product Passport™: ${passport.product.name} | IndoPharm`,
    description: `Verified 9-stage pharmaceutical supply-chain traceability record for ${passport.product.name} (${passport.product.genericName}). Origin, batch serialization, and QA release status.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPassportPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { destination = 'US' } = await searchParams;
  const passport = await getProductPassport(slug, destination);

  if (!passport) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <Container>
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E6ECE7] mb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#59605A]">
            <Link href="/" className="hover:text-[#2F5D3A] transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <Link href="/medicines" className="hover:text-[#2F5D3A] transition-colors">
              Medicines
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <Link href={`/medicines/${slug}`} className="hover:text-[#2F5D3A] transition-colors truncate">
              {passport.product.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <span className="text-[#111411] font-medium">Passport™</span>
          </nav>

          <Link
            href={`/medicines/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5D3A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Product Details
          </Link>
        </div>

        {/* Full Product Passport Component */}
        <ProductPassport passport={passport} />
      </Container>
    </div>
  );
}
