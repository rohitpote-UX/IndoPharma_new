'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  FileCheck,
  Truck,
  Boxes,
  RotateCcw,
  Users,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type DatePreset = 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_quarter' | 'this_year';

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DatePreset>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/dashboard/overview?range=${range}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load command center overview.');
      }

      setData(json.overview);
    } catch (err: any) {
      setError(err.message || 'Error fetching dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [range]);

  const presets: Array<{ id: DatePreset; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Header & Date Range Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#E6ECE7] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A]">
              Internal Operations Command Center
            </span>
            <Badge variant="green" size="sm">
              Authoritative PostgreSQL
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411] mt-1">
            Operational Overview & Business Intelligence
          </h1>
          <p className="text-xs text-[#59605A] mt-0.5">
            Real-time multi-country pharmaceutical fulfillment, clinical verification queues, and financial performance.
          </p>
        </div>

        {/* Date Range Selector & Refresh Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-[#CBD7CE] rounded-xl p-1 shadow-2xs">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setRange(p.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  range === p.id
                    ? 'bg-[#2F5D3A] text-white shadow-2xs'
                    : 'text-[#59605A] hover:text-[#111411] hover:bg-[#F3F7F3]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            className="text-xs h-9 flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#FFF1F0] border border-[#FFCCC7] flex items-center justify-between text-xs text-[#CF1322]">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" onClick={() => fetchOverview()} className="h-7 text-xs bg-[#CF1322] text-white">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2F5D3A]" />
          <p className="text-sm font-semibold text-[#111411]">Loading Operational Intelligence...</p>
          <p className="text-xs text-[#59605A]">Executing server-side aggregations across transactional tables...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* SECTION 1: ATTENTION REQUIRED CENTER (TOP OPERATIONAL PRIORITY) */}
          {data.attentionItems?.length > 0 && (
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CF1322] animate-ping" />
                  <h2 className="text-sm font-bold text-[#111411] uppercase tracking-wider">
                    Attention Required ({data.attentionItems.length} Critical Items)
                  </h2>
                </div>
                <span className="text-xs text-[#848D85]">Immediate operational bottlenecks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.attentionItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-4 border flex flex-col justify-between space-y-3 transition ${
                      item.severity === 'CRITICAL'
                        ? 'bg-[#FFF1F0] border-[#FFCCC7]'
                        : 'bg-[#FFFBE6] border-[#FFE58F]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.severity === 'CRITICAL'
                              ? 'bg-[#CF1322] text-white'
                              : 'bg-[#D48806] text-white'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-lg font-bold text-[#111411]">{item.count}</span>
                      </div>
                      <h3 className="text-xs font-bold text-[#111411] pt-1">{item.title}</h3>
                      <p className="text-[11px] text-[#59605A] leading-relaxed">{item.description}</p>
                    </div>

                    <Link
                      href={item.actionUrl}
                      className="inline-flex items-center justify-between text-xs font-bold text-[#2F5D3A] hover:underline pt-2 border-t border-black/5"
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CORE KPI GRID (8 PRIMARY METRICS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Revenue Card */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Net Revenue</span>
                <DollarSign className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.revenue ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      ${data.revenue.netRevenueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {data.revenue.growthPercentage !== null && (
                      <span
                        className={`text-xs font-bold flex items-center ${
                          data.revenue.growthPercentage >= 0 ? 'text-[#2F5D3A]' : 'text-[#CF1322]'
                        }`}
                      >
                        {data.revenue.growthPercentage >= 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                        )}
                        {Math.abs(data.revenue.growthPercentage)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#59605A] leading-snug">
                    Gross: ${data.revenue.grossSalesUsd.toLocaleString()} • Refunds: -${data.revenue.refundsUsd.toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted to Finance Roles</span>
                </div>
              )}
            </div>

            {/* 2. Total Orders Card */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Orders</span>
                <Package className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.orders ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.orders.totalOrders.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#59605A]">
                      AOV: ${data.orders.averageOrderValueUsd.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.orders.delivered} Delivered • {data.orders.cancelled} Cancelled
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted Scope</span>
                </div>
              )}
            </div>

            {/* 3. Pending Verification Workload */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Verification</span>
                <FileCheck className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.verification ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.verification.totalPending}
                    </span>
                    {data.verification.overdueSlaCount > 0 ? (
                      <Badge variant="danger" size="sm">
                        {data.verification.overdueSlaCount} &gt; 4h SLA
                      </Badge>
                    ) : (
                      <Badge variant="green" size="sm">
                        Within SLA
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.verification.underReview} Under Review • {data.verification.moreInformationRequired} Clarification Needed
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted (Clinical Only)</span>
                </div>
              )}
            </div>

            {/* 4. Pending Shipments */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Shipments</span>
                <Truck className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.shipments ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.shipments.pendingShipmentsCount}
                    </span>
                    <span className="text-xs text-[#848D85]">
                      Oldest: {data.shipments.oldestPendingShipmentWaitHours}h
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.shipments.bondedHub} Bonded Hub • {data.shipments.exportCustoms} Export Customs
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted Scope</span>
                </div>
              )}
            </div>

            {/* 5. Inventory Attention */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Inventory Attention</span>
                <Boxes className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.inventory ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.inventory.criticalCount + data.inventory.outOfStockCount}
                    </span>
                    <span className="text-xs text-[#CF1322] font-semibold">
                      {data.inventory.outOfStockCount} Out of Stock
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.inventory.lowStockCount} Low Stock • {data.inventory.nearExpiryBatchesCount} Batches Expiring &le; 90d
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted Scope</span>
                </div>
              )}
            </div>

            {/* 6. Refunds Activity */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Processed Refunds</span>
                <RotateCcw className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.refunds ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      ${data.refunds.refundAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-[#59605A]">
                      ({data.refunds.refundCount} records)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.refunds.pendingRefundsCount} Pending Approval
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted (Finance Only)</span>
                </div>
              )}
            </div>

            {/* 7. Customers Growth */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Patients</span>
                <Users className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.customers ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.customers.totalRegisteredCustomers.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#2F5D3A] font-semibold">
                      +{data.customers.newCustomersInPeriod} in period
                    </span>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    {data.customers.purchasingCustomersInPeriod} active purchasers
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted Scope</span>
                </div>
              )}
            </div>

            {/* 8. Repeat Customers & Retention */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs text-[#848D85]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Repeat Patients</span>
                <Repeat className="h-4 w-4 text-[#2F5D3A]" />
              </div>

              {data.customers ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111411]">
                      {data.customers.repeatCustomersCount}
                    </span>
                    <Badge variant="green" size="sm">
                      {data.customers.repeatCustomerRate}% Rate
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#59605A]">
                    Completed &ge; 2 qualifying maintenance refills
                  </p>
                </>
              ) : (
                <div className="py-2 text-xs text-[#848D85] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Restricted Scope</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: VISUAL REVENUE TREND & OPERATIONAL FUNNEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Revenue Trend Chart (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#2F5D3A]" />
                  <h3 className="text-sm font-bold text-[#111411]">Revenue & Order Trajectory</h3>
                </div>
                <span className="text-xs text-[#848D85]">Captured Sales Time-Series</span>
              </div>

              {data.revenueTrends && data.revenueTrends.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {/* SVG Line / Bar Chart Representation */}
                  <div className="h-48 flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-[#E6ECE7]">
                    {data.revenueTrends.map((point: any) => {
                      const maxRevenue = Math.max(...data.revenueTrends.map((p: any) => p.netRevenueUsd), 1);
                      const heightPercent = Math.min(100, Math.max(10, (point.netRevenueUsd / maxRevenue) * 100));

                      return (
                        <div
                          key={point.date}
                          className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end cursor-pointer"
                        >
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#111411] text-white p-2 rounded-lg text-[10px] whitespace-nowrap z-20 shadow-xl pointer-events-none">
                            <div className="font-bold">{point.label}</div>
                            <div>Revenue: ${point.netRevenueUsd.toFixed(2)}</div>
                            <div>Orders: {point.orderCount}</div>
                          </div>

                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#2F5D3A] rounded-t-sm group-hover:bg-[#254A2E] transition-all duration-300"
                          />
                          <span className="text-[9px] text-[#848D85] truncate max-w-[40px] text-center">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#848D85]">
                    <span>Timezone: {data.period.timezone}</span>
                    <span className="font-medium text-[#2F5D3A]">Daily Authoritative Ingestion</span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-[#848D85] text-xs">
                  {data.revenue ? 'No orders captured in this period.' : 'Financial analytics restricted.'}
                </div>
              )}
            </div>

            {/* Operational Order Funnel (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#2F5D3A]" />
                  <h3 className="text-sm font-bold text-[#111411]">Fulfillment Pipeline Funnel</h3>
                </div>
                <span className="text-xs text-[#848D85]">Status Distribution</span>
              </div>

              {data.orders ? (
                <div className="space-y-3 pt-2 text-xs">
                  {[
                    { label: 'Placed (Total)', count: data.orders.totalOrders, color: 'bg-[#CBD7CE]' },
                    { label: 'Clinical Verified', count: data.orders.prescriptionVerified, color: 'bg-[#8BB293]' },
                    { label: 'Picking & Batch COA', count: data.orders.processing, color: 'bg-[#4B8558]' },
                    { label: 'Export Cleared / Dispatched', count: data.orders.dispatched, color: 'bg-[#2F5D3A]' },
                    { label: 'International / In-Transit', count: data.orders.inTransit, color: 'bg-[#254A2E]' },
                    { label: 'Delivered to Patient', count: data.orders.delivered, color: 'bg-[#18311E]' },
                  ].map((step) => {
                    const pct = data.orders.totalOrders > 0 ? (step.count / data.orders.totalOrders) * 100 : 0;
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#111411]">{step.label}</span>
                          <span className="font-bold text-[#111411]">
                            {step.count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#F3F7F3] overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${step.color} transition-all duration-500`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-[#848D85] text-xs">Order metrics restricted.</div>
              )}
            </div>
          </div>

          {/* SECTION 4: INVENTORY DEFICIT WATCHLIST & RECENT ORDERS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Inventory Attention Table (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-[#2F5D3A]" />
                  <h3 className="text-sm font-bold text-[#111411]">Inventory Deficits Requiring Reorder</h3>
                </div>
                <Link href="/admin?tab=inventory" className="text-xs text-[#2F5D3A] font-semibold hover:underline">
                  View Full Catalog &rarr;
                </Link>
              </div>

              {data.inventory?.criticalItems?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6ECE7] text-[#848D85] font-semibold uppercase text-[10px]">
                        <th className="pb-2.5">Medication / SKU</th>
                        <th className="pb-2.5">Available</th>
                        <th className="pb-2.5">Threshold</th>
                        <th className="pb-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6ECE7]">
                      {data.inventory.criticalItems.map((item: any) => (
                        <tr key={item.productId} className="hover:bg-[#FAFBF9]">
                          <td className="py-2.5">
                            <div className="font-bold text-[#111411]">{item.productName}</div>
                            <div className="font-mono text-[10px] text-[#848D85]">{item.sku}</div>
                          </td>
                          <td className="py-2.5 font-bold text-[#111411]">{item.quantityOnHand} units</td>
                          <td className="py-2.5 text-[#59605A]">
                            Reorder: {item.reorderPoint} • Safety: {item.safetyStock}
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant={
                                item.status === 'OUT_OF_STOCK'
                                  ? 'danger'
                                  : item.status === 'CRITICAL'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {item.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-[#59605A] text-xs space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-[#2F5D3A] mx-auto" />
                  <p className="font-semibold text-[#111411]">All Inventory Thresholds Healthy</p>
                  <p>No active formulations are below configured reorder points.</p>
                </div>
              )}
            </div>

            {/* Recent Orders Feed (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#2F5D3A]" />
                  <h3 className="text-sm font-bold text-[#111411]">Recent Orders</h3>
                </div>
                <span className="text-xs text-[#848D85]">Live Feed</span>
              </div>

              {data.recentOrders?.length > 0 ? (
                <div className="divide-y divide-[#E6ECE7] text-xs">
                  {data.recentOrders.map((ord: any) => (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#111411]">
                          #{ord.orderNumber} • ${ord.totalUsd.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-[#59605A]">
                          {ord.customerEmail} • {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={ord.status === 'DELIVERED' ? 'green' : 'warning'}
                          size="sm"
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </Badge>
                        <Link
                          href={`/orders/${ord.orderNumber}/tracking`}
                          className="p-1 text-[#848D85] hover:text-[#2F5D3A]"
                          title="View Live Shipment Tracking"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[#848D85] text-xs">No recent orders recorded.</div>
              )}
            </div>
          </div>

          {/* SECTION 5: AUDIT LOG OPERATIONAL EVENT FEED */}
          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2F5D3A]" />
                <h3 className="text-sm font-bold text-[#111411]">Operational Event & Audit Log Stream</h3>
              </div>
              <span className="text-xs text-[#848D85]">Security Monitored</span>
            </div>

            {data.recentActivity?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {data.recentActivity.map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E6ECE7] space-y-1">
                    <span className="text-[10px] font-bold text-[#2F5D3A] uppercase tracking-wider block truncate">
                      {log.action}
                    </span>
                    <div className="font-semibold text-[#111411] truncate">
                      {log.resourceType} #{log.resourceId}
                    </div>
                    <div className="text-[10px] text-[#848D85] flex items-center justify-between pt-1">
                      <span>{log.userRole}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#848D85] text-xs">No audit events recorded in window.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
