import { Metadata } from 'next';
import { MedicinesCatalogClient } from './MedicinesCatalogClient';

export const metadata: Metadata = {
  title: 'Medicines Catalogue | IndoPharm',
  description:
    'Explore verified generic maintenance therapies sourced directly from audited WHO-GMP manufacturing facilities with transparent landed pricing.',
};

export default function MedicinesPage() {
  return <MedicinesCatalogClient />;
}
