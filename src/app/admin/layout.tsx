'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Boxes,
  Truck,
  Users,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  LogOut,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession(data.user);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Global search execution with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`/api/admin/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const role = session?.role || 'PATIENT';
  const isPatient = role === 'PATIENT';
  const isStaff = !isPatient;

  // Role-aware navigation links
  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, visible: true },
    {
      label: 'Orders',
      href: '/admin?tab=orders',
      icon: Package,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OPS_WAREHOUSE' || role === 'SUPPORT_AGENT',
    },
    {
      label: 'Prescriptions',
      href: '/account?tab=queue',
      icon: FileText,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'CLINICAL_PHARMACIST' || role === 'COMPLIANCE_ADMIN',
    },
    {
      label: 'Inventory & Stock',
      href: '/admin?tab=inventory',
      icon: Boxes,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OPS_WAREHOUSE',
    },
    {
      label: 'Fulfillment & Shipments',
      href: '/admin?tab=shipments',
      icon: Truck,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OPS_WAREHOUSE',
    },
    {
      label: 'Customers & Retention',
      href: '/admin?tab=customers',
      icon: Users,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPPORT_AGENT',
    },
    {
      label: 'Finance & Refunds',
      href: '/admin?tab=refunds',
      icon: RotateCcw,
      visible: role === 'ADMIN' || role === 'SUPER_ADMIN',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111411] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#4CAF50]" />
          <p className="text-xs text-[#848D85]">Authorizing Internal Command Center...</p>
        </div>
      </div>
    );
  }

  // If consumer patient tries to access admin layout, show clear security block
  if (isPatient) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-white border border-[#FFCCC7] p-8 shadow-xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-[#CF1322] mx-auto" />
          <h2 className="text-xl font-bold text-[#111411]">Restricted Administrative Area</h2>
          <p className="text-xs text-[#59605A] leading-relaxed">
            Your account ({session?.email}) has consumer patient privileges. Access to IndoPharma’s internal operations command center is strictly limited to authorized personnel.
          </p>
          <div className="pt-2">
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#2F5D3A] text-white text-xs font-semibold hover:bg-[#254A2E] transition"
            >
              Return to Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col md:flex-row text-[#111411]">
      {/* Collapsible Left Command Center Sidebar */}
      <aside className="w-full md:w-64 bg-[#111411] text-white flex flex-col shrink-0 border-r border-[#242A24]">
        {/* Brand Banner */}
        <div className="p-5 border-b border-[#242A24] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4CAF50]">
                Command Center
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
              IndoPharm Ops
            </h1>
          </div>
          <Badge variant="green" size="sm" className="bg-[#1C261D] text-[#4CAF50] border-[#2E3D30]">
            v22.0
          </Badge>
        </div>

        {/* User Identity / Role Pill */}
        <div className="p-4 border-b border-[#242A24] bg-[#181D18]/50 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#2F5D3A] flex items-center justify-center text-white font-bold text-xs">
            {role.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{session?.email}</div>
            <span className="text-[10px] text-[#A1ACA2] font-mono block">
              {role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems
            .filter((i) => i.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#2F5D3A] text-white shadow-xs'
                      : 'text-[#CBD7CE] hover:text-white hover:bg-[#1E251F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-40" />
                </Link>
              );
            })}
        </nav>

        {/* Footer Navigation Switcher */}
        <div className="p-4 border-t border-[#242A24] space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#181D18] hover:bg-[#202720] text-[#A1ACA2] hover:text-white transition text-[11px]"
          >
            <span>Public Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#CF1322] hover:bg-[#CF1322]/10 transition text-[11px] font-semibold"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 bg-white border-b border-[#E6ECE7] px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
          {/* Global Administrative Search with Dropdown */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="h-4 w-4 text-[#848D85] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, tracking #, SKU, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setSearchOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#CBD7CE] focus:border-[#2F5D3A] focus:outline-hidden text-xs bg-[#FAFBF9]"
              />
              {searchLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2F5D3A] absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchOpen && searchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E6ECE7] shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6ECE7] text-[10px] uppercase font-bold text-[#848D85]">
                  <span>Search Matches</span>
                  <button onClick={() => setSearchOpen(false)} className="hover:text-[#111411] cursor-pointer">
                    ✕ Close
                  </button>
                </div>

                {/* Orders */}
                {searchResults.orders?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block mb-1">
                      Orders
                    </span>
                    {searchResults.orders.map((o: any) => (
                      <Link
                        key={o.id}
                        href={o.url}
                        onClick={() => setSearchOpen(false)}
                        className="block px-2.5 py-1.5 rounded-lg hover:bg-[#F3F7F3] text-xs transition"
                      >
                        <div className="font-semibold text-[#111411]">{o.title}</div>
                        <div className="text-[10px] text-[#59605A]">{o.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Shipments */}
                {searchResults.shipments?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block mb-1">
                      Shipments
                    </span>
                    {searchResults.shipments.map((s: any) => (
                      <Link
                        key={s.id}
                        href={s.url}
                        onClick={() => setSearchOpen(false)}
                        className="block px-2.5 py-1.5 rounded-lg hover:bg-[#F3F7F3] text-xs transition"
                      >
                        <div className="font-semibold text-[#111411]">{s.title}</div>
                        <div className="text-[10px] text-[#59605A]">{s.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products */}
                {searchResults.products?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block mb-1">
                      Medicines & SKUs
                    </span>
                    {searchResults.products.map((p: any) => (
                      <Link
                        key={p.id}
                        href={p.url}
                        onClick={() => setSearchOpen(false)}
                        className="block px-2.5 py-1.5 rounded-lg hover:bg-[#F3F7F3] text-xs transition"
                      >
                        <div className="font-semibold text-[#111411]">{p.title}</div>
                        <div className="text-[10px] text-[#59605A]">{p.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {searchResults.customers?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block mb-1">
                      Customers
                    </span>
                    {searchResults.customers.map((c: any) => (
                      <Link
                        key={c.id}
                        href={c.url}
                        onClick={() => setSearchOpen(false)}
                        className="block px-2.5 py-1.5 rounded-lg hover:bg-[#F3F7F3] text-xs transition"
                      >
                        <div className="font-semibold text-[#111411]">{c.title}</div>
                        <div className="text-[10px] text-[#59605A]">{c.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.orders?.length === 0 &&
                  searchResults.shipments?.length === 0 &&
                  searchResults.products?.length === 0 &&
                  searchResults.customers?.length === 0 && (
                    <p className="text-xs text-[#848D85] py-4 text-center">
                      No administrative records found matching &quot;{searchQuery}&quot;.
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Right Header Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#59605A]">
              <ShieldCheck className="h-4 w-4 text-[#2F5D3A]" />
              <span className="font-medium">RBAC Policy Active</span>
            </div>
            <Link
              href="/account?tab=queue"
              className="px-3 py-1.5 rounded-lg bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs font-semibold flex items-center gap-1 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Clinical Queue</span>
            </Link>
          </div>
        </header>

        {/* Main Dashboard Child Pages */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
