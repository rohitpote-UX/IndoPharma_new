import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — India → USA Pharmaceutical Commerce Platform`,
  description: siteConfig.shortDescription,
  keywords: [
    'pharmaceutical commerce',
    'generic medication',
    'India to USA',
    'FDA personal importation',
    'transparent drug pricing',
    'verified manufacturer provenance',
  ],
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: `${siteConfig.name} — India → USA Pharmaceutical Commerce Platform`,
    description: siteConfig.shortDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
