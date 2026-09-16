import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MOCK_CATALOG } from '@/lib/mock/catalog';
import { ProductDetailClient } from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_CATALOG.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_CATALOG.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Medicine Not Found | IndoPharm',
    };
  }

  return {
    title: `${product.name} (${product.strength}) | IndoPharm`,
    description: `Verified ${product.name} (${product.brandReferenceName}). Sourced from audited facilities with transparent landed pricing of $${product.retailPriceUsd.toFixed(2)}.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = MOCK_CATALOG.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
