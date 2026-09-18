'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  FileText,
  Package,
  ShieldCheck,
  ArrowRight,
  Upload,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Download,
  RefreshCw,
  Plus,
  Loader2,
  Lock,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PrescriptionUploadModal } from '@/components/prescriptions/PrescriptionUploadModal';
import { PrescriptionReviewQueue } from '@/components/prescriptions/PrescriptionReviewQueue';

type Tab = 'overview' | 'orders' | 'prescriptions' | 'reorder' | 'saved' | 'addresses' | 'profile' | 'queue';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reorderItems, setReorderItems] = useState<any[]>([]);
  const [savedMedicines, setSavedMedicines] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [resubmitRxId, setResubmitRxId] = useState<string | undefined>(undefined);

  // Load Session and Dashboard Data
  useEffect(() => {
    loadSessionAndData();
  }, []);

  const loadSessionAndData = async () => {
    try {
      setLoading(true);
      const sessRes = await fetch('/api/auth/session');
      const sessData = await sessRes.json();

      if (sessData.authenticated && sessData.user) {
        setSession(sessData.user);

        // Fetch user data in parallel
        await Promise.allSettled([
          fetchOrders(),
          fetchPrescriptions(),
          fetchReorderItems(),
          fetchSavedMedicines(),
          fetchAddresses(),
          fetchProfile(),
        ]);
      }
    } catch (err) {
      console.error('Failed to load user account:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/customer/orders');
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  };

  const fetchPrescriptions = async () => {
    const res = await fetch('/api/prescriptions');
    if (res.ok) {
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    }
  };

  const fetchReorderItems = async () => {
    const res = await fetch('/api/customer/reorder');
    if (res.ok) {
      const data = await res.json();
      setReorderItems(data.reorderItems || []);
    }
  };

  const fetchSavedMedicines = async () => {
    const res = await fetch('/api/customer/saved-medicines');
    if (res.ok) {
      const data = await res.json();
      setSavedMedicines(data.savedMedicines || []);
    }
  };

  const fetchAddresses = async () => {
    const res = await fetch('/api/customer/addresses');
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.addresses || []);
    }
  };

  const fetchProfile = async () => {
    const res = await fetch('/api/customer/profile');
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile || null);
    }
  };

  const handleDownloadRx = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/prescriptions/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate download link');
      window.open(data.prescription.downloadUrl, '_blank');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteReorder = async (productId: string, quantity: number) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await fetch('/api/customer/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId, quantity }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reorder failed.');
      setFeedback({
        type: 'success',
        message: `Reorder #${data.orderNumber} initiated successfully! View in Orders.`,
      });
      fetchOrders();
      fetchReorderItems();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSaved = async (productId: string) => {
    try {
      await fetch('/api/customer/saved-medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      fetchSavedMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  const isStaff =
    session?.role === 'CLINICAL_PHARMACIST' ||
    session?.role === 'ADMIN' ||
    session?.role === 'SUPER_ADMIN';

  return (
    <div className="bg-[#FAFBF9] min-h-screen py-10 sm:py-14">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[#E6ECE7] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A]">
                Patient & Care Portal
              </span>
              <Badge variant="green" size="sm">
                HIPAA / ePHI Protected
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111411] mt-1">
              My Account
            </h1>
            <p className="text-sm text-[#59605A] mt-1">
              Verified chronic maintenance medications, automated refill eligibility, and direct carrier tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setResubmitRxId(undefined);
                setUploadModalOpen(true);
              }}
              className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs h-10 flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              Upload Prescription
            </Button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center justify-between text-xs ${
              feedback.type === 'success'
                ? 'bg-[#F3F7F3] border border-[#2F5D3A]/20 text-[#2F5D3A]'
                : 'bg-[#FFF1F0] border border-[#FFCCC7] text-[#CF1322]'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="font-bold ml-4 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E6ECE7] text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: FileText },
            { id: 'reorder', label: 'Reorder Center', icon: RefreshCw },
            { id: 'saved', label: `Saved (${savedMedicines.length})`, icon: Heart },
            { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
            { id: 'profile', label: 'Profile & Security', icon: Lock },
            ...(isStaff ? [{ id: 'queue' as Tab, label: 'Rx Clinical Queue', icon: ShieldCheck }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2F5D3A] text-white shadow-xs'
                    : 'text-[#59605A] hover:text-[#111411] hover:bg-[#E6ECE7]/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="mt-8">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Patient Summary Card (4 cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#F3F7F3] border border-[#CBD7CE] flex items-center justify-center text-[#2F5D3A]">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111411]">
                      {profile?.name || session?.email?.split('@')[0] || 'Patient'}
                    </h2>
                    <span className="text-xs text-[#59605A]">{session?.email || 'patient@example.com'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6ECE7] space-y-3 text-xs text-[#59605A]">
                  <div className="flex items-center justify-between">
                    <span>Account Role:</span>
                    <Badge variant="green" size="sm">
                      {session?.role || 'PATIENT'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approved Prescriptions:</span>
                    <span className="font-bold text-[#111411]">
                      {prescriptions.filter((p) => p.status === 'APPROVED' || p.status === 'VERIFIED').length} on file
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed Orders:</span>
                    <span className="font-bold text-[#111411]">
                      {orders.filter((o) => o.status === 'DELIVERED').length} delivered
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#848D85] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#2F5D3A]" />
                  <span>256-Bit ePHI Encryption Protected</span>
                </div>
              </div>

              {/* Right Side: Active Prescriptions & Recent Orders (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Recent Orders Overview */}
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#111411]">
                      <Package className="h-4 w-4 text-[#2F5D3A]" />
                      <span>Recent Orders</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#2F5D3A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All ({orders.length}) <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-[#59605A] py-6 text-center">No orders placed yet.</p>
                  ) : (
                    <div className="divide-y divide-[#E6ECE7]">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#111411]">
                              Order #{order.orderNumber} • ${Number(order.totalUsd).toFixed(2)}
                            </div>
                            <span className="text-[11px] text-[#59605A]">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 1} items
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={order.status === 'DELIVERED' ? 'green' : 'warning'}
                              size="sm"
                            >
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                            <Link
                              href={`/orders/${order.orderNumber}/tracking`}
                              className="px-2.5 py-1 rounded-lg border border-[#E6ECE7] hover:bg-[#F3F7F3] text-[11px] font-semibold text-[#2F5D3A] flex items-center gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              Track
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescriptions on File Overview */}
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#111411]">
                      <FileText className="h-4 w-4 text-[#2F5D3A]" />
                      <span>Prescriptions on File</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('prescriptions')}
                      className="text-xs text-[#2F5D3A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Manage Prescriptions <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {prescriptions.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-[#59605A] mb-3">No prescriptions uploaded yet.</p>
                      <Button
                        size="sm"
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        Upload Prescription
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E6ECE7]">
                      {prescriptions.slice(0, 3).map((rx) => (
                        <div key={rx.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-[#111411] block">
                              {rx.originalFileName || `Prescription #${rx.id.substring(0, 8)}`}
                            </strong>
                            <span className="text-[11px] text-[#59605A]">
                              Doctor: {rx.prescriberName || 'On File'} • v{rx.version}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                rx.status === 'APPROVED' || rx.status === 'VERIFIED'
                                  ? 'green'
                                  : rx.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {rx.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-[#111411]">Complete Order History</h3>
                <span className="text-xs text-[#59605A]">{orders.length} total orders</span>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-12 text-center text-[#59605A]">
                  <Package className="h-8 w-8 text-[#CBD7CE] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#111411]">No Orders Yet</p>
                  <p className="text-xs mt-1">Browse our verified catalog to place your first medication order.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E6ECE7] gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#111411]">
                          Order #{order.orderNumber}
                        </span>
                        <div className="text-[11px] text-[#59605A]">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={order.status === 'DELIVERED' ? 'green' : 'warning'}
                          size="sm"
                        >
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm font-bold text-[#111411]">
                          ${Number(order.totalUsd).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-[#E6ECE7] text-xs">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-[#111411]">
                              {item.productName || item.product?.name}
                            </div>
                            <span className="text-[11px] text-[#59605A]">
                              Qty: {item.quantity} • ${Number(item.unitPriceUsd).toFixed(2)} each
                            </span>
                          </div>
                          <div className="font-semibold text-[#111411]">
                            ${Number(item.totalPriceUsd).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#E6ECE7] flex items-center justify-between">
                      <div className="text-[11px] text-[#848D85] flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-[#2F5D3A]" />
                        <span>Carrier: {order.shipment?.carrier || 'DHL / International Air'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.orderNumber}/tracking`}
                          className="px-3 py-1.5 rounded-lg bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs font-semibold flex items-center gap-1"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          View Live Tracking
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111411]">Prescriptions on File</h3>
                  <p className="text-xs text-[#59605A]">
                    Human-verified clinical documents. Signed download links expire automatically.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setResubmitRxId(undefined);
                    setUploadModalOpen(true);
                  }}
                  className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Upload New
                </Button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-12 text-center text-[#59605A]">
                  <FileText className="h-8 w-8 text-[#CBD7CE] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#111411]">No Prescriptions Uploaded</p>
                  <p className="text-xs mt-1">Upload your doctor’s prescription to enable scheduled medication orders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => {
                    const isApproved = rx.status === 'APPROVED' || rx.status === 'VERIFIED';
                    const needsAction =
                      rx.status === 'MORE_INFORMATION_REQUIRED' || rx.status === 'REJECTED';

                    return (
                      <div
                        key={rx.id}
                        className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={isApproved ? 'green' : needsAction ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {rx.status.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-[10px] font-mono text-[#848D85]">
                            v{rx.version} • {new Date(rx.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#111411] truncate">
                            {rx.originalFileName || `Rx-${rx.id.substring(0, 8)}`}
                          </h4>
                          <p className="text-xs text-[#59605A]">
                            Prescriber: {rx.prescriberName || 'Doctor on record'}
                          </p>
                          {rx.patientName && (
                            <p className="text-xs text-[#848D85]">Patient: {rx.patientName}</p>
                          )}
                        </div>

                        {rx.customerMessage && (
                          <div className="p-2.5 rounded-lg bg-[#FFFBE6] border border-[#FFE58F] text-[11px] text-[#D48806]">
                            <strong>Pharmacist Note:</strong> {rx.customerMessage}
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#E6ECE7] flex items-center justify-between">
                          <button
                            onClick={() => handleDownloadRx(rx.id)}
                            disabled={actionLoading}
                            className="text-xs text-[#2F5D3A] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Signed Document
                          </button>

                          {needsAction && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setResubmitRxId(rx.id);
                                setUploadModalOpen(true);
                              }}
                              className="bg-[#D48806] text-white hover:bg-[#AD6800] text-xs h-7 px-2.5"
                            >
                              Resubmit Rx
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REORDER CENTER */}
          {activeTab === 'reorder' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111411]">Chronic Maintenance Reorder Center</h3>
                <p className="text-xs text-[#59605A]">
                  One-click refill with real-time inventory validation, price delta transparency, and active prescription checks.
                </p>
              </div>

              {reorderItems.length === 0 ? (
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-12 text-center text-[#59605A]">
                  <RefreshCw className="h-8 w-8 text-[#CBD7CE] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#111411]">No Refillable Products</p>
                  <p className="text-xs mt-1">Products from your past orders will automatically appear here for instant refills.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E6ECE7] rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs">
                  {reorderItems.map((item) => {
                    const priceDiff = Number(item.priceDeltaUsd);
                    return (
                      <div key={item.productId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-[#111411]">{item.productName}</strong>
                            <Badge variant={item.stockAvailable ? 'green' : 'danger'} size="sm">
                              {item.stockAvailable ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#59605A] mt-0.5">
                            Previous: ${item.previousPriceUsd.toFixed(2)} • Current: ${item.currentPriceUsd.toFixed(2)}
                            {item.priceChanged && (
                              <span className={`ml-2 font-bold ${priceDiff > 0 ? 'text-[#CF1322]' : 'text-[#2F5D3A]'}`}>
                                ({priceDiff > 0 ? `+$${priceDiff.toFixed(2)}` : `-$${Math.abs(priceDiff).toFixed(2)}`})
                              </span>
                            )}
                          </p>
                          <div className="text-[11px] text-[#848D85] mt-1">
                            {item.requiresPrescription ? (
                              item.hasActivePrescription ? (
                                <span className="text-[#2F5D3A] flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Valid Prescription on File
                                </span>
                              ) : (
                                <span className="text-[#D48806] flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> New Prescription Required
                                </span>
                              )
                            ) : (
                              <span>Over-the-counter formulation</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={!item.canReorder || actionLoading}
                            onClick={() => handleExecuteReorder(item.productId, item.suggestedQuantity)}
                            className="bg-[#2F5D3A] text-white hover:bg-[#254A2E] text-xs h-9 px-4"
                          >
                            {actionLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              `Refill (${item.suggestedQuantity} Qty)`
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED MEDICINES */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111411]">Saved Maintenance Medications</h3>
                <p className="text-xs text-[#59605A]">
                  Fast access to bookmarked formulations with live pricing and stock updates.
                </p>
              </div>

              {savedMedicines.length === 0 ? (
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-12 text-center text-[#59605A]">
                  <Heart className="h-8 w-8 text-[#CBD7CE] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#111411]">No Saved Medicines</p>
                  <p className="text-xs mt-1">Click the heart icon on any medicine card to save it for quick refills.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedMedicines.map((saved) => (
                    <div
                      key={saved.id}
                      className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant={saved.inStock ? 'green' : 'danger'} size="sm">
                          {saved.inStock ? 'In Stock' : 'Unavailable'}
                        </Badge>
                        <button
                          onClick={() => handleToggleSaved(saved.productId)}
                          className="text-[#CF1322] hover:opacity-75 cursor-pointer"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#111411]">{saved.productName}</h4>
                        <span className="text-xs text-[#59605A]">{saved.manufacturer}</span>
                      </div>

                      <div className="pt-2 border-t border-[#E6ECE7] flex items-center justify-between">
                        <span className="text-sm font-bold text-[#111411]">
                          ${saved.priceUsd.toFixed(2)}
                        </span>
                        <Link
                          href={`/medicines/${saved.slug}`}
                          className="text-xs font-semibold text-[#2F5D3A] hover:underline"
                        >
                          View Medicine →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111411]">Delivery Addresses</h3>
                  <p className="text-xs text-[#59605A]">
                    Verified shipping and billing destinations for international medical transit.
                  </p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-[#E6ECE7] bg-white p-12 text-center text-[#59605A]">
                  <MapPin className="h-8 w-8 text-[#CBD7CE] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#111411]">No Addresses Saved</p>
                  <p className="text-xs mt-1">Your shipping address will be saved during checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-2xl border border-[#E6ECE7] bg-white p-5 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="green" size="sm">
                          {addr.type}
                        </Badge>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-[#2F5D3A] uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#111411] font-medium leading-relaxed">
                        {addr.line1}
                        {addr.line2 && <>, {addr.line2}</>}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl rounded-2xl border border-[#E6ECE7] bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111411]">Patient Profile & Identity</h3>
                <p className="text-xs text-[#59605A]">
                  Manage contact details and emergency pharmaceutical notes.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#111411] mb-1">Email Address (Identity)</label>
                  <input
                    type="email"
                    value={session?.email || ''}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD7CE] bg-[#FAFBF9] text-[#848D85] text-xs"
                  />
                  <span className="text-[10px] text-[#848D85] mt-0.5 block">
                    Contact clinical support to update your verified primary identity.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-[#111411] mb-1">Account Role & Privileges</label>
                  <div className="p-2.5 rounded-lg border border-[#CBD7CE] bg-[#F3F7F3] text-xs font-semibold text-[#2F5D3A]">
                    {session?.role || 'PATIENT'} • Verified ePHI Permissions
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6ECE7] flex items-center justify-between">
                  <span className="text-xs text-[#59605A]">Password & Session Security</span>
                  <Link
                    href="/api/auth/logout"
                    className="text-xs text-[#CF1322] font-semibold hover:underline"
                  >
                    Sign Out All Devices
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLINICAL QUEUE (STAFF ONLY) */}
          {activeTab === 'queue' && isStaff && (
            <div className="space-y-4">
              <PrescriptionReviewQueue />
            </div>
          )}
        </div>
      </Container>

      {/* Upload / Resubmission Modal */}
      <PrescriptionUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          fetchPrescriptions();
          fetchOrders();
        }}
        resubmitPrescriptionId={resubmitRxId}
      />
    </div>
  );
}
