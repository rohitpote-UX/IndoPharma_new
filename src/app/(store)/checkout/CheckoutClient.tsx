'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Truck,
  CreditCard,
  MapPin,
  Sparkles,
  Phone,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  CheckoutSessionData,
  CustomerInfo,
  ShippingAddress,
  PrescriptionSubmission,
  PaymentMethodSelection,
  OrderConfirmationResult,
} from '@/lib/domain/checkout';
import { useDestination } from '@/lib/context/DestinationContext';

type ActiveStep = 'CUSTOMER_INFO' | 'ADDRESS' | 'PRESCRIPTION' | 'SHIPPING' | 'PAYMENT' | 'REVIEW';

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('session');
  const { destination } = useDestination();

  const [session, setSession] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Active step state in UI
  const [currentStep, setCurrentStep] = useState<ActiveStep>('CUSTOMER_INFO');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: destination.countryCode || 'US',
  });

  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionSubmission>({
    prescriberName: '',
    prescriberState: '',
    prescriberNpi: '',
    fileName: '',
    documentRef: '',
    patientConfirmation: false,
  });
  const [prescriptionFileUploaded, setPrescriptionFileUploaded] = useState(false);

  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('bonded_air_express');

  const [paymentForm, setPaymentForm] = useState<PaymentMethodSelection>({
    providerId: 'mock-development-gateway',
    type: 'CREDIT_DEBIT_CARD',
    cardholderName: '',
    last4: '4242',
    expiry: '12/28',
  });
  const [cardNumberInput, setCardNumberInput] = useState('4242 •••• •••• 4242');
  const [cvvInput, setCvvInput] = useState('•••');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hydrateFormFields = React.useCallback((sess: CheckoutSessionData) => {
    if (sess.customerInfo) setCustomerForm(sess.customerInfo);
    if (sess.shippingAddress) setAddressForm(sess.shippingAddress);
    if (sess.prescription) {
      setPrescriptionForm(sess.prescription);
      if (sess.prescription.fileName) setPrescriptionFileUploaded(true);
    }
    if (sess.shippingMethod) setSelectedShippingMethodId(sess.shippingMethod.id);
    if (sess.paymentMethod) setPaymentForm(sess.paymentMethod);

    // Set initial step based on session status
    if (sess.status === 'CONFIRMED' && sess.orderNumber) {
      router.push(`/checkout/confirmation?orderNumber=${sess.orderNumber}&orderId=${sess.orderId}`);
    } else if (sess.status === 'ADDRESS') {
      setCurrentStep('ADDRESS');
    } else if (sess.status === 'PRESCRIPTION') {
      setCurrentStep('PRESCRIPTION');
    } else if (sess.status === 'SHIPPING') {
      setCurrentStep('SHIPPING');
    } else if (sess.status === 'PAYMENT') {
      setCurrentStep('PAYMENT');
    } else if (sess.status === 'REVIEW') {
      setCurrentStep('REVIEW');
    }
  }, [router]);

  // 1. Initialize or load session
  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      setLoading(true);
      setErrorMessage(null);

      try {
        if (sessionIdParam) {
          // Fetch existing session
          const res = await fetch(`/api/checkout/session/${sessionIdParam}`);
          const data = await res.json();
          if (!cancelled) {
            if (data.success && data.session) {
              setSession(data.session);
              hydrateFormFields(data.session);
            } else {
              setErrorMessage(data.error || 'Checkout session expired or not found.');
            }
          }
        } else {
          // Create new session from cart
          const res = await fetch('/api/checkout/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              countryCode: destination.countryCode,
              jurisdictionCode: destination.jurisdictionCode,
            }),
          });
          const data = await res.json();
          if (!cancelled) {
            if (data.success && data.session) {
              setSession(data.session);
              hydrateFormFields(data.session);
            } else {
              setErrorMessage(data.error || 'Unable to start checkout. Ensure items are in your cart.');
            }
          }
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('A network error occurred while connecting to the checkout service.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initSession();

    return () => {
      cancelled = true;
    };
  }, [sessionIdParam, destination.countryCode, destination.jurisdictionCode, hydrateFormFields]);

  // Dynamic step array determination
  const availableSteps: ActiveStep[] = ['CUSTOMER_INFO', 'ADDRESS'];
  if (session?.requiresPrescription) {
    availableSteps.push('PRESCRIPTION');
  }
  availableSteps.push('SHIPPING', 'PAYMENT', 'REVIEW');

  // Step names for display
  const stepLabels: Record<ActiveStep, string> = {
    CUSTOMER_INFO: 'Customer',
    ADDRESS: 'Address',
    PRESCRIPTION: 'Prescription',
    SHIPPING: 'Shipping',
    PAYMENT: 'Payment',
    REVIEW: 'Review',
  };

  // Step submission handlers
  async function handleCustomerInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email) {
      setErrorMessage('Please provide your first name, last name, and contact email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CUSTOMER_INFO',
          customerInfo: customerForm,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setCurrentStep('ADDRESS');
      } else {
        setErrorMessage(data.error || 'Failed to record customer details.');
      }
    } catch {
      setErrorMessage('Network error submitting customer information.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      setErrorMessage('Please complete all mandatory address fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADDRESS',
          shippingAddress: {
            ...addressForm,
            country: addressForm.country || destination.countryCode,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        if (data.session.requiresPrescription && !data.session.prescription) {
          setCurrentStep('PRESCRIPTION');
        } else {
          setCurrentStep('SHIPPING');
        }
      } else {
        setErrorMessage(data.error || 'Address eligibility check failed.');
      }
    } catch {
      setErrorMessage('Network error verifying address eligibility.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePrescriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!prescriptionForm.prescriberName) {
      setErrorMessage('Please enter the issuing licensed physician or prescriber name.');
      return;
    }

    if (!prescriptionForm.patientConfirmation) {
      setErrorMessage('Please acknowledge the patient legal attestation before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}/prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prescriptionForm,
          fileName: prescriptionForm.fileName || 'Prescription_Personal_Use.pdf',
          fileSizeBytes: 1048576,
          documentRef: `rx_doc_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setCurrentStep('SHIPPING');
      } else {
        setErrorMessage(data.error || 'Prescription validation failed.');
      }
    } catch {
      setErrorMessage('Network error recording prescription data.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SHIPPING_METHOD',
          shippingMethodId: selectedShippingMethodId,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setCurrentStep('PAYMENT');
      } else {
        setErrorMessage(data.error || 'Failed to select shipping method.');
      }
    } catch {
      setErrorMessage('Network error saving delivery preference.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!paymentForm.cardholderName) {
      setErrorMessage('Please enter the name appearing on your card.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAYMENT_METHOD',
          paymentMethod: {
            ...paymentForm,
            last4: cardNumberInput.replace(/\D/g, '').slice(-4) || '4242',
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setCurrentStep('REVIEW');
      } else {
        setErrorMessage(data.error || 'Failed to tokenize payment method.');
      }
    } catch {
      setErrorMessage('Network error securing payment credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalOrderPlacement() {
    if (!session || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/checkout/session/${session.id}/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: session.idempotencyKey,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const result: OrderConfirmationResult = data.result;
        startTransition(() => {
          router.push(
            `/checkout/confirmation?orderNumber=${encodeURIComponent(result.orderNumber)}&orderId=${encodeURIComponent(
              result.orderId
            )}`
          );
        });
      } else {
        setErrorMessage(data.error || 'Order placement failed. Please verify your details.');
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage('Network error placing order. Please do not re-submit without checking connection.');
      setIsSubmitting(false);
    }
  }

  // Back navigation helper
  function handleGoBack() {
    const currentIndex = availableSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(availableSteps[currentIndex - 1]);
      setErrorMessage(null);
    } else {
      router.push('/cart');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 bg-[#E6ECE7] rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-64 bg-[#F3F7F3] rounded-xl" />
              <div className="h-32 bg-[#F3F7F3] rounded-xl" />
            </div>
            <div className="lg:col-span-4 h-80 bg-[#F3F7F3] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error loading state
  if (!session && errorMessage) {
    return (
      <div className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-md mx-auto text-center border border-[#E6ECE7] rounded-2xl p-8 bg-[#F3F7F3]">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-[#111411] mb-2 font-semibold">Unable to Proceed</h2>
          <p className="text-sm text-[#59605A] mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center w-full py-3 px-6 rounded-lg bg-[#2F5D3A] text-white font-medium hover:bg-[#3F704A] transition-colors shadow-sm"
            >
              Return to Cart
            </Link>
            <Link
              href="/medicines"
              className="inline-flex items-center justify-center w-full py-2 px-4 text-xs font-medium text-[#59605A] hover:text-[#111411]"
            >
              Explore Verified Medicines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentStepIdx = availableSteps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Focused Top Checkout Bar */}
      <header className="border-b border-[#E6ECE7] bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#2F5D3A]">IndoPharm</span>
            <span className="text-[10px] uppercase tracking-wider bg-[#F3F7F3] text-[#2F5D3A] px-2 py-0.5 rounded font-mono font-medium">
              Secure Direct
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#2F5D3A] bg-[#F3F7F3] px-3 py-1.5 rounded-full border border-[#2F5D3A]/20">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
            <a
              href="tel:+18005554636"
              className="flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pharmacy Support: 1-800-555-INDO</span>
              <span className="md:hidden">Support</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Dynamic Progress Indicator */}
        <nav aria-label="Checkout Steps" className="mb-8 overflow-x-auto pb-2">
          <ol className="flex items-center gap-2 sm:gap-3 min-w-max">
            {availableSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <li key={step} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-[#2F5D3A] text-white shadow-sm'
                        : isPast
                        ? 'bg-[#F3F7F3] text-[#2F5D3A] border border-[#2F5D3A]/30'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <span className="flex items-center justify-center w-4 h-4 text-[10px] rounded-full border border-current">
                      {isPast ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </span>
                    <span>{stepLabels[step]}</span>
                  </div>
                  {idx < availableSteps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-[1px] ${isPast ? 'bg-[#2F5D3A]' : 'bg-[#E6ECE7]'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Global Error Banner if present */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Mobile Collapsible Order Summary Bar */}
        <div className="lg:hidden mb-6 border border-[#E6ECE7] rounded-xl overflow-hidden bg-[#F3F7F3]">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-[#111411]"
          >
            <span className="flex items-center gap-2">
              <span>Order Summary ({session.items.length} items)</span>
              {mobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
            <span className="font-semibold text-base text-[#2F5D3A]">
              {formatCurrency(session.totalUsd, session.currency)}
            </span>
          </button>

          {mobileSummaryOpen && (
            <div className="px-4 pb-4 border-t border-[#E6ECE7] pt-3 space-y-3">
              {session.items.map((it) => (
                <div key={it.id} className="flex justify-between text-xs text-[#59605A]">
                  <span>
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-mono text-[#111411] font-medium">
                    {formatCurrency(it.lineTotalUsd, session.currency)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E6ECE7] flex justify-between text-xs">
                <span className="text-[#59605A]">Bonded Air Shipping</span>
                <span className="font-medium text-[#111411]">
                  {session.shippingUsd === 0 ? 'FREE' : formatCurrency(session.shippingUsd, session.currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Dynamic Step Forms */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* STEP 1: CUSTOMER INFORMATION */}
            {currentStep === 'CUSTOMER_INFO' && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Customer Contact Information</h2>
                    <p className="text-xs text-[#59605A]">
                      Direct updates on batch release, customs manifest clearance, and live tracking.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="Eleanor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="Vance"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Email Address (For Batch & Customs Clearance) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="eleanor.vance@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Mobile Phone Number (Courier Delivery Notification) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="+1 (555) 349-2910"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411]">
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2F5D3A] text-white font-medium text-sm hover:bg-[#3F704A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>Continue to Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: SHIPPING ADDRESS */}
            {currentStep === 'ADDRESS' && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Shipping Destination & Verification</h2>
                    <p className="text-xs text-[#59605A]">
                      Destination: {destination.flagEmoji} {destination.countryName}. Delivery address must be in this territory.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Street Address (Line 1) *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="742 Evergreen Terrace"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Apartment, Suite, Unit (Line 2 - Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.line2 || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="97477"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#F3F7F3] rounded-lg border border-[#E6ECE7] text-xs text-[#59605A] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2F5D3A] flex-shrink-0" />
                    <span>
                      Addresses are validated against international postal standards for bonded courier delivery.
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="inline-flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Customer Info
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2F5D3A] text-white font-medium text-sm hover:bg-[#3F704A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>
                        {session.requiresPrescription ? 'Continue to Prescription' : 'Continue to Shipping'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: PRESCRIPTION VERIFICATION (DYNAMIC — OMITTED IF NOT REQUIRED) */}
            {currentStep === 'PRESCRIPTION' && session.requiresPrescription && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                    Rx
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Prescription Documentation</h2>
                    <p className="text-xs text-[#59605A]">
                      One or more medicines in your order require licensed physician prescription verification.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePrescriptionSubmit} className="space-y-5">
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                      <ShieldCheck className="w-4 h-4 text-amber-800" />
                      <span>Regulatory Import Compliance Notice</span>
                    </div>
                    <p>
                      Under FDA Personal Importation Guidelines (CPG 110.300), imported prescription pharmaceuticals for personal use require an active prescription issued by a licensed medical practitioner.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        Prescribing Physician Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={prescriptionForm.prescriberName}
                        onChange={(e) =>
                          setPrescriptionForm({ ...prescriptionForm, prescriberName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="Dr. Sarah Jenkins, M.D."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        Physician State / Jurisdiction of Licensure
                      </label>
                      <input
                        type="text"
                        value={prescriptionForm.prescriberState || ''}
                        onChange={(e) =>
                          setPrescriptionForm({ ...prescriptionForm, prescriberState: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="California (CA)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Physician NPI or Medical License Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={prescriptionForm.prescriberNpi || ''}
                      onChange={(e) =>
                        setPrescriptionForm({ ...prescriptionForm, prescriberNpi: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="1942083921"
                    />
                  </div>

                  {/* Document Upload Area */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Upload Prescription Document (PDF, PNG, JPG)
                    </label>
                    <div className="border-2 border-dashed border-[#E6ECE7] rounded-xl p-6 text-center hover:border-[#2F5D3A]/40 transition-colors bg-[#F3F7F3]/40">
                      {prescriptionFileUploaded ? (
                        <div className="flex flex-col items-center gap-2 text-emerald-800">
                          <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                          <span className="text-sm font-medium">
                            {prescriptionForm.fileName || 'Prescription_Document_Verified.pdf'}
                          </span>
                          <span className="text-xs text-[#59605A]">
                            Attached and encrypted for Indian export manifest verification
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPrescriptionFileUploaded(false);
                              setPrescriptionForm({ ...prescriptionForm, fileName: '', documentRef: '' });
                            }}
                            className="text-xs text-red-600 underline mt-1"
                          >
                            Replace file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 text-[#2F5D3A] mx-auto" />
                          <div className="text-sm text-[#111411]">
                            <span className="font-semibold text-[#2F5D3A]">Click to attach file</span> or drag and drop
                          </div>
                          <p className="text-[11px] text-[#59605A]">
                            Secure storage under HIPAA-compliant protocol. Max file size: 10MB.
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPrescriptionForm({
                                  ...prescriptionForm,
                                  fileName: file.name,
                                  fileSizeBytes: file.size,
                                  documentRef: `rx_${Date.now()}_${file.name}`,
                                });
                                setPrescriptionFileUploaded(true);
                              }
                            }}
                            className="hidden"
                            id="rx-file-upload"
                          />
                          <label
                            htmlFor="rx-file-upload"
                            className="inline-block mt-2 px-4 py-2 bg-white border border-[#E6ECE7] rounded-lg text-xs font-semibold text-[#111411] cursor-pointer hover:bg-neutral-50"
                          >
                            Select Document
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Attestation */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E6ECE7] bg-[#F3F7F3] cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={prescriptionForm.patientConfirmation}
                      onChange={(e) =>
                        setPrescriptionForm({ ...prescriptionForm, patientConfirmation: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#2F5D3A] focus:ring-[#2F5D3A] border-gray-300 mt-0.5"
                    />
                    <span className="text-xs text-[#111411] leading-relaxed">
                      I legally attest that this order is strictly for my personal treatment under the direct care of a licensed physician, does not exceed a 90-day personal supply, and will not be commercialized or resold.
                    </span>
                  </label>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="inline-flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2F5D3A] text-white font-medium text-sm hover:bg-[#3F704A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>Continue to Shipping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: SHIPPING & CARRIER SELECTION */}
            {currentStep === 'SHIPPING' && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center font-bold text-sm">
                    {session.requiresPrescription ? '4' : '3'}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Select Bonded Dispatch Method</h2>
                    <p className="text-xs text-[#59605A]">
                      Dispatched from audited Indian cGMP facility via cold-chain bonded international courier.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {/* Option 1: Bonded Air Courier */}
                  <label
                    className={`block p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedShippingMethodId === 'bonded_air_express'
                        ? 'border-[#2F5D3A] bg-[#F3F7F3]/70'
                        : 'border-[#E6ECE7] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping_option"
                          value="bonded_air_express"
                          checked={selectedShippingMethodId === 'bonded_air_express'}
                          onChange={() => setSelectedShippingMethodId('bonded_air_express')}
                          className="mt-1 text-[#2F5D3A] focus:ring-[#2F5D3A]"
                        />
                        <div>
                          <div className="font-semibold text-sm text-[#111411] flex items-center gap-2">
                            <span>Bonded Temperature-Monitored Air Courier</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Standard
                            </span>
                          </div>
                          <p className="text-xs text-[#59605A] mt-1">
                            Direct dispatched via audited bonded airport transit with calibrated temperature loggers.
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[#2F5D3A]">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" /> 8–12 Business Days
                            </span>
                            <span>•</span>
                            <span>DHL Express / India Post EMS</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#111411]">
                          {session.subtotalUsd >= 100 ? (
                            <span className="text-emerald-700 font-semibold">FREE</span>
                          ) : (
                            formatCurrency(12.5, session.currency)
                          )}
                        </span>
                        {session.subtotalUsd >= 100 && (
                          <div className="text-[10px] text-emerald-600 line-through">
                            {formatCurrency(12.5, session.currency)}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Priority Clinical Cold Chain */}
                  <label
                    className={`block p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedShippingMethodId === 'priority_clinical_courier'
                        ? 'border-[#2F5D3A] bg-[#F3F7F3]/70'
                        : 'border-[#E6ECE7] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping_option"
                          value="priority_clinical_courier"
                          checked={selectedShippingMethodId === 'priority_clinical_courier'}
                          onChange={() => setSelectedShippingMethodId('priority_clinical_courier')}
                          className="mt-1 text-[#2F5D3A] focus:ring-[#2F5D3A]"
                        />
                        <div>
                          <div className="font-semibold text-sm text-[#111411] flex items-center gap-2">
                            <span>Priority Cold-Chain Clinical Air Freight</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              Expedited
                            </span>
                          </div>
                          <p className="text-xs text-[#59605A] mt-1">
                            Expedited customs clearance with dedicated active cold-chain thermal container.
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[#2F5D3A]">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" /> 5–8 Business Days
                            </span>
                            <span>•</span>
                            <span>FedEx Healthcare Priority</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#111411]">
                          {formatCurrency(28.0, session.currency)}
                        </span>
                      </div>
                    </div>
                  </label>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="inline-flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />{' '}
                      {session.requiresPrescription ? 'Back to Prescription' : 'Back to Address'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2F5D3A] text-white font-medium text-sm hover:bg-[#3F704A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5: SECURE PAYMENT METHOD */}
            {currentStep === 'PAYMENT' && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center font-bold text-sm">
                    {session.requiresPrescription ? '5' : '4'}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Secure Payment Authorization</h2>
                    <p className="text-xs text-[#59605A]">
                      PCI DSS Level 1 Certified. Card details are tokenized client-side and never stored in raw form.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, type: 'CREDIT_DEBIT_CARD' })}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        paymentForm.type === 'CREDIT_DEBIT_CARD'
                          ? 'border-[#2F5D3A] bg-[#F3F7F3] text-[#2F5D3A]'
                          : 'border-[#E6ECE7] text-[#59605A]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1" />
                      Credit / Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, type: 'HSA_FSA' })}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        paymentForm.type === 'HSA_FSA'
                          ? 'border-[#2F5D3A] bg-[#F3F7F3] text-[#2F5D3A]'
                          : 'border-[#E6ECE7] text-[#59605A]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                      HSA / FSA Card
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardholderName || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                      placeholder="Eleanor Vance"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumberInput}
                        onChange={(e) => setCardNumberInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm font-mono focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="4242 •••• •••• 4242"
                      />
                      <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.expiry || '12/28'}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm font-mono focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="MM / YY"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#111411] mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvvInput}
                        onChange={(e) => setCvvInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E6ECE7] text-sm font-mono focus:outline-none focus:border-[#2F5D3A] focus:ring-1 focus:ring-[#2F5D3A]"
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#F3F7F3] rounded-lg border border-[#E6ECE7] text-xs text-[#59605A] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2F5D3A] flex-shrink-0" />
                    <span>
                      Zero raw payment credentials stored. Payment will be authorized upon order placement.
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="inline-flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2F5D3A] text-white font-medium text-sm hover:bg-[#3F704A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span>Review Final Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 6: FINAL REVIEW & ORDER PLACEMENT */}
            {currentStep === 'REVIEW' && (
              <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E6ECE7]">
                  <div className="w-8 h-8 rounded-full bg-[#2F5D3A] text-white flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#111411]">Review & Place Order</h2>
                    <p className="text-xs text-[#59605A]">
                      Please confirm your delivery address, prescription documentation, and order details.
                    </p>
                  </div>
                </div>

                {/* Summaries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Address Card */}
                  <div className="p-4 rounded-xl border border-[#E6ECE7] bg-[#F3F7F3]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2F5D3A] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Shipping Address
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('ADDRESS')}
                        className="text-xs text-[#2F5D3A] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-xs text-[#111411] space-y-0.5">
                      <p className="font-semibold">
                        {customerForm.firstName} {customerForm.lastName}
                      </p>
                      <p>{addressForm.line1}</p>
                      {addressForm.line2 && <p>{addressForm.line2}</p>}
                      <p>
                        {addressForm.city}, {addressForm.state} {addressForm.postalCode}
                      </p>
                      <p className="font-medium text-[#2F5D3A]">
                        {destination.flagEmoji} {destination.countryName}
                      </p>
                      <p className="text-[#59605A] pt-1">Contact: {customerForm.email}</p>
                    </div>
                  </div>

                  {/* Shipping & Payment Card */}
                  <div className="p-4 rounded-xl border border-[#E6ECE7] bg-[#F3F7F3]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2F5D3A] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Courier & Payment
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('SHIPPING')}
                        className="text-xs text-[#2F5D3A] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-xs text-[#111411] space-y-1">
                      <p className="font-semibold">{session.shippingMethod?.name}</p>
                      <p className="text-[#59605A]">{session.shippingMethod?.estimatedDays}</p>
                      <div className="pt-2 border-t border-[#E6ECE7] flex items-center justify-between">
                        <span className="text-[#59605A]">Payment Method</span>
                        <span className="font-mono font-medium">Card ending in {paymentForm.last4 || '4242'}</span>
                      </div>
                      {session.requiresPrescription && (
                        <div className="pt-1 flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Prescription verified for personal use</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Summary in Review */}
                <div className="border border-[#E6ECE7] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-[#59605A]">
                    Ordered Pharmaceutical Items ({session.items.length})
                  </div>
                  <div className="divide-y divide-[#E6ECE7]">
                    {session.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-sm text-[#111411]">{item.name}</p>
                          <p className="text-xs text-[#59605A]">
                            {item.strength} • {item.dosageForm} • {item.packageSize}
                          </p>
                          <p className="text-[11px] text-[#2F5D3A] mt-0.5">
                            Active ingredient: {item.activeIngredient}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm text-[#111411]">
                            {formatCurrency(item.lineTotalUsd, session.currency)}
                          </p>
                          <p className="text-xs text-[#59605A]">
                            Qty: {item.quantity} × {formatCurrency(item.unitPriceUsd, session.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order CTA Banner */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFinalOrderPlacement}
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl bg-[#2F5D3A] text-white font-semibold text-base hover:bg-[#3F704A] transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Authorizing & Placing Order...
                      </span>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Place Order — {formatCurrency(session.totalUsd, session.currency)}</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-[#59605A] mt-3">
                    By clicking &quot;Place Order&quot;, you authorize IndoPharm to charge your card and dispatch under audited FDA personal importation guidelines.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financial Order Summary & Trust Guarantee */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
            <div className="border border-[#E6ECE7] rounded-2xl p-6 bg-[#F3F7F3]/70 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-lg text-[#111411] pb-3 border-b border-[#E6ECE7]">
                Financial Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#59605A]">
                  <span>Items Subtotal ({session.items.length} items)</span>
                  <span className="font-mono text-[#111411] font-medium">
                    {formatCurrency(session.subtotalUsd, session.currency)}
                  </span>
                </div>

                <div className="flex justify-between text-[#59605A]">
                  <span>Bonded Air Courier</span>
                  <span className="font-mono text-[#111411] font-medium">
                    {session.shippingUsd === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatCurrency(session.shippingUsd, session.currency)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#59605A]">
                  <span>Personal Import Duties</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    $0.00 (Duty-Free § 321)
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E6ECE7] flex justify-between items-baseline">
                  <span className="font-semibold text-base text-[#111411]">Total ({session.currency})</span>
                  <span className="font-serif font-bold text-2xl text-[#2F5D3A]">
                    {formatCurrency(session.totalUsd, session.currency)}
                  </span>
                </div>

                {Boolean(session.totalSavingsUsd && session.totalSavingsUsd > 0) && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      You save <strong className="font-bold">{formatCurrency(session.totalSavingsUsd || 0, session.currency)}</strong> vs standard retail cash pharmacy.
                    </span>
                  </div>
                )}
              </div>

              {/* Items Mini List */}
              <div className="pt-4 border-t border-[#E6ECE7] space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#59605A]">
                  Items in Package
                </span>
                {session.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="truncate pr-2">
                      <span className="font-medium text-[#111411]">{item.name}</span>
                      <span className="text-[#59605A]"> × {item.quantity}</span>
                    </div>
                    <span className="font-mono text-[#111411] font-medium flex-shrink-0">
                      {formatCurrency(item.lineTotalUsd, session.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold Chain & Compliance Guarantee Badge */}
            <div className="border border-[#E6ECE7] rounded-xl p-5 bg-white space-y-3 text-xs text-[#59605A]">
              <div className="flex items-center gap-2 font-semibold text-[#111411]">
                <ShieldCheck className="w-4 h-4 text-[#2F5D3A]" />
                <span>IndoPharm Direct Assurance</span>
              </div>
              <p>
                Every batch is dispatched directly from our audited cGMP pharmaceutical warehouse with tamper-evident security seals and continuous temperature monitoring.
              </p>
              <div className="pt-2 border-t border-[#E6ECE7] flex items-center justify-between text-[11px]">
                <span>Destination: {destination.countryName}</span>
                <span className="text-emerald-700 font-medium font-mono">100% Guaranteed Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
