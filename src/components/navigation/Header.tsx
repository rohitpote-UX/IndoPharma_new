'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X, ArrowUpRight } from 'lucide-react';
import { SearchOverlay } from '@/components/navigation/SearchOverlay';

export function Header() {
  const pathname = usePathname();
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
    { label: 'Medicines', href: '/medicines' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Trust', href: '/trust' },
    { label: 'Help', href: '/help' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full pt-2 sm:pt-3 md:pt-4 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <header
          className={`mx-auto max-w-[1440px] w-full rounded-2xl border transition-all duration-300 pointer-events-auto ${
            isScrolled
              ? 'h-[68px] sm:h-[72px] bg-white/95 backdrop-blur-md border-[#E6ECE7] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
              : 'h-[74px] sm:h-[80px] bg-white border-[#E6ECE7]'
          }`}
        >
          <div className="h-full px-4 sm:px-8 lg:px-10 flex items-center justify-between">
            {/* LEFT: Brand Wordmark */}
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#2F5D3A] rounded-lg p-1 -m-1"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F5D3A] text-white">
                <span className="font-serif font-black text-base tracking-tighter">I</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111411]">
                  Indo<span className="text-[#2F5D3A]">Pharm</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#59605A] font-semibold -mt-1 hidden sm:block">
                  Verified Direct Sourcing
                </span>
              </div>
            </Link>

            {/* CENTER: Editorial Navigation */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-7 lg:gap-9 text-[14px] font-medium"
            >
              {navLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group relative py-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5D3A] rounded-sm ${
                      active
                        ? 'text-[#2F5D3A] font-semibold'
                        : 'text-[#59605A] hover:text-[#111411]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {/* Subtle 200–300ms green indicator reveal / active indicator */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full bg-[#2F5D3A] rounded-full origin-left transition-transform duration-250 ease-out ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Search, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Premium Compact Search Action */}
              <Link
                href="/search"
                aria-label="Search Catalog"
                className={`flex h-10 sm:h-11 items-center gap-2 sm:gap-2.5 rounded-full border border-[#E6ECE7] bg-[#FFFFFF] px-3.5 sm:px-4 text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2F5D3A] ${
                  isActive('/search')
                    ? 'border-[#2F5D3A] text-[#2F5D3A] bg-[#F3F7F3]'
                    : 'text-[#59605A] hover:border-[#2F5D3A]/40 hover:bg-[#F3F7F3] hover:text-[#111411]'
                }`}
              >
                <Search className="h-3.5 w-3.5 text-[#2F5D3A]" />
                <span className="hidden sm:inline">Search medicines</span>
                <kbd className="hidden lg:inline-block rounded border border-[#E6ECE7] bg-[#F3F7F3] px-1.5 py-0.5 text-[10px] font-mono text-[#848D85]">
                  ⌘K
                </kbd>
              </Link>

              {/* Clean Account Utility */}
              <Link
                href="/account"
                aria-label="Account Portal"
                className={`hidden sm:flex h-10 sm:h-11 px-3 items-center gap-1.5 rounded-full border border-[#E6ECE7] bg-white text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5D3A] ${
                  isActive('/account')
                    ? 'border-[#2F5D3A] text-[#2F5D3A] bg-[#F3F7F3]'
                    : 'text-[#59605A] hover:border-[#D3DDD5] hover:text-[#111411] hover:bg-[#F3F7F3]'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Account</span>
              </Link>

              {/* Clean Lucide Cart */}
              <Link
                href="/cart"
                aria-label="Cart (0 items)"
                className={`relative flex h-10 sm:h-11 items-center gap-1.5 rounded-full border border-[#E6ECE7] bg-white px-3 sm:px-3.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5D3A] ${
                  isActive('/cart')
                    ? 'border-[#2F5D3A] text-[#2F5D3A] bg-[#F3F7F3]'
                    : 'text-[#111411] hover:border-[#2F5D3A]/40 hover:bg-[#F3F7F3]'
                }`}
              >
                <ShoppingBag className="h-4 w-4 text-[#2F5D3A]" />
                <span className="hidden sm:inline text-xs font-medium">Cart</span>
                <span className="flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-[#2F5D3A] text-[10px] font-bold text-white ml-0.5">
                  0
                </span>
              </Link>

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-[#E6ECE7] bg-white text-[#111411] hover:bg-[#F3F7F3] transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#E6ECE7] bg-white px-6 py-5 rounded-b-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleMobileNavClick}
                    className={`min-h-[48px] flex items-center justify-between text-sm font-semibold py-1 border-b border-[#E6ECE7]/60 ${
                      isActive(item.href) ? 'text-[#2F5D3A]' : 'text-[#111411] hover:text-[#2F5D3A]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#848D85]" />
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={handleMobileNavClick}
                  className={`min-h-[48px] flex items-center justify-between text-sm font-semibold py-1 border-b border-[#E6ECE7]/60 ${
                    isActive('/account') ? 'text-[#2F5D3A]' : 'text-[#111411] hover:text-[#2F5D3A]'
                  }`}
                >
                  <span>Account</span>
                  <ArrowUpRight className="h-4 w-4 text-[#848D85]" />
                </Link>
              </nav>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/search"
                  onClick={handleMobileNavClick}
                  className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl border border-[#E6ECE7] bg-[#F3F7F3] text-xs font-semibold text-[#2F5D3A] cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Search All Medications</span>
                </Link>

                <div className="text-center text-[11px] text-[#59605A] pt-1">
                  Pharmacist Support: 1-800-555-INDO
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
