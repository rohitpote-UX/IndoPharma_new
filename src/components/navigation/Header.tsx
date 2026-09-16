'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingBag, Menu, X, Shield, PhoneCall } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SearchOverlay } from '@/components/navigation/SearchOverlay';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Medicines', href: '#catalog' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Trust & Quality', href: '#trust' },
    { label: 'Pricing Model', href: '#pricing' },
    { label: 'Help', href: '#support' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'h-18 bg-[#FAFAF7]/95 border-b border-[#E4E7DC] backdrop-blur-xs shadow-2xs'
            : 'h-20 sm:h-22 bg-[#FAFAF7] border-b border-[#E4E7DC]'
        }`}
      >
        <Container className="h-full flex items-center justify-between">
          {/* LEFT: Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#596B3A] rounded-lg p-1 -m-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#596B3A] text-white shadow-2xs">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#171914] leading-tight">
                Indo<span className="text-[#596B3A]">Pharm</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#52564C] -mt-0.5">
                Pharmaceutical Commerce
              </span>
            </div>
          </Link>

          {/* CENTER: Main Navigation (Desktop) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium text-[#52564C]"
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[#43522B] transition-colors relative py-2 focus-visible:outline-2 focus-visible:outline-[#596B3A] rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search dialog"
              className="flex h-11 items-center gap-2.5 rounded-xl border border-[#E4E7DC] bg-white px-3 sm:px-4 text-xs font-medium text-[#52564C] hover:border-[#D1D6C5] hover:bg-[#FAFAF7] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#596B3A]"
            >
              <Search className="h-4 w-4 text-[#596B3A]" />
              <span className="hidden sm:inline">Search medicines...</span>
              <kbd className="hidden lg:inline-block rounded border border-[#E4E7DC] bg-[#FAFAF7] px-1.5 py-0.5 text-[10px] font-mono text-[#8A9081]">
                ⌘K
              </kbd>
            </button>

            {/* Pharmacist Consultation Hotline Button */}
            <a
              href="tel:1-800-555-4636"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-[#E4E7DC] bg-[#EEF1E6] px-3.5 h-11 text-xs font-semibold text-[#43522B] hover:bg-[#E2E7D7] transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#596B3A]" />
              <span>1-800-555-INDO</span>
            </a>

            {/* Account Placeholder */}
            <Link
              href="#account"
              aria-label="Account Portal"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4E7DC] bg-white text-[#52564C] hover:border-[#D1D6C5] hover:text-[#171914] transition-colors focus-visible:outline-2 focus-visible:outline-[#596B3A]"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Cart Button */}
            <Link
              href="#cart"
              aria-label="Cart (0 items)"
              className="relative flex h-11 items-center gap-2 rounded-xl bg-[#596B3A] px-3.5 text-xs font-semibold text-white hover:bg-[#43522B] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-[#596B3A]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#43522B]">
                0
              </span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4E7DC] bg-white text-[#171914] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E4E7DC] bg-[#FAFAF7] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center text-base font-semibold text-[#171914] hover:text-[#43522B] py-1 border-b border-[#E4E7DC]/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl border border-[#E4E7DC] bg-white text-sm font-semibold text-[#171914]"
              >
                <Search className="h-4 w-4 text-[#596B3A]" />
                <span>Search Catalog</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#52564C] pt-2">
                <PhoneCall className="h-3.5 w-3.5 text-[#596B3A]" />
                <span>Pharmacist Support: 1-800-555-INDO</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
