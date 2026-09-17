'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DestinationInfo } from '@/lib/domain/eligibility';
import { APPROVED_COUNTRIES, CountryRecord, getDestinationInfo } from '@/lib/services/eligibilityService';

interface DestinationContextType {
  destination: DestinationInfo;
  setDestinationCountry: (countryCode: string, jurisdictionCode?: string) => void;
  availableCountries: CountryRecord[];
  isLoading: boolean;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export function DestinationProvider({ children }: { children: React.ReactNode }) {
  const [destination, setDestination] = useState<DestinationInfo>(() => {
    if (typeof document !== 'undefined') {
      try {
        const match = document.cookie.match(/(?:^|; )indopharm_dest=([^;]*)/);
        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (parsed.countryCode) {
            return getDestinationInfo(parsed.countryCode, parsed.jurisdictionCode);
          }
        }
      } catch {
        // fallback
      }
    }
    return getDestinationInfo('US');
  });
  const isLoading = false;

  const setDestinationCountry = useCallback((countryCode: string, jurisdictionCode?: string) => {
    const updated = getDestinationInfo(countryCode, jurisdictionCode);
    setDestination(updated);

    try {
      const val = encodeURIComponent(JSON.stringify({ countryCode: updated.countryCode, jurisdictionCode }));
      document.cookie = `indopharm_dest=${val}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error('Failed to set destination cookie:', e);
    }
  }, []);

  return (
    <DestinationContext.Provider
      value={{
        destination,
        setDestinationCountry,
        availableCountries: APPROVED_COUNTRIES,
        isLoading,
      }}
    >
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestination() {
  const context = useContext(DestinationContext);
  if (!context) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
}
