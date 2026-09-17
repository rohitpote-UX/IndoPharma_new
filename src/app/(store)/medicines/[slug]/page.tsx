import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, VERIFIED_PRODUCTS_STORE } from '@/lib/services/searchService';
import { ProductDetailClient } from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VERIFIED_PRODUCTS_STORE.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Medicine Not Found | IndoPharm',
    };
  }

  return {
    title: `${product.name} (${product.strength}) | IndoPharm`,
    description: `Verified ${product.name} (${product.brandReferenceName}). Sourced from audited facilities with transparent landed pricing of $${product.retailPriceUsd.toFixed(2)}.`,
    openGraph: {
      title: `${product.name} (${product.strength}) | IndoPharm`,
      description: `Verified pharmaceutical product sourced from audited WHO-GMP facilities.`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      allProducts={VERIFIED_PRODUCTS_STORE}
    />
  );
}
