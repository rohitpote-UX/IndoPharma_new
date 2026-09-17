'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { SearchSuggestion as SearchSuggestionType } from '@/lib/domain/product';
import { SearchSuggestionItem } from './SearchSuggestion';

interface ProductSearchProps {
  initialQuery?: string;
  onSearchSubmit?: (query: string) => void;
  showHeadline?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  initialQuery = '',
  onSearchSubmit,
  showHeadline = true,
  className = '',
  autoFocus = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUrlQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery || currentUrlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(currentUrlQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state during render when URL query parameter changes
  if (currentUrlQuery !== prevUrlQuery) {
    setPrevUrlQuery(currentUrlQuery);
    setQuery(currentUrlQuery);
  }

  // Debounced suggestion fetch
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&suggest=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuggestions(json.data);
          setIsOpen(true);
        }
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const executeSearch = (searchVal: string) => {
    setIsOpen(false);
    const trimmed = searchVal.trim();
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push('/search');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          router.push(`/medicines/${selected.slug}`);
          setIsOpen(false);
        } else {
          executeSearch(query);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {showHeadline && (
        <div className="mb-4 text-left">
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#111411]">
            Find your medicine.
          </h2>
          <p className="text-sm text-[#59605A] mt-1">
            Search by medicine, brand, manufacturer, strength or SKU.
          </p>
        </div>
      )}

      {/* Main Search Bar Container */}
      <div className="relative w-full">
        <div className="relative flex items-center w-full bg-white border border-[#E6ECE7] rounded-xl shadow-xs transition-all focus-within:border-[#2F5D3A] focus-within:ring-2 focus-within:ring-[#2F5D3A]/10">
          <div className="pl-4.5 pr-2 flex items-center pointer-events-none text-neutral-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#2F5D3A]" />
            ) : (
              <Search className="w-5 h-5 text-[#2F5D3A]" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="search-suggestions-list"
            aria-autocomplete="list"
            aria-label="Search pharmaceutical catalogue"
            autoFocus={autoFocus}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder="What medicine are you looking for?"
            className="w-full h-13 sm:h-14 py-3 pr-10 text-base text-[#111411] placeholder:text-neutral-400 bg-transparent focus:outline-hidden"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            id="search-suggestions-list"
            role="listbox"
            aria-label="Search suggestions"
            className="absolute z-50 left-0 right-0 mt-2 bg-white border border-[#E6ECE7] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="py-1">
              {suggestions.map((suggestion, idx) => (
                <SearchSuggestionItem
                  key={`${suggestion.slug}-${idx}`}
                  suggestion={suggestion}
                  isActive={idx === selectedIndex}
                  onSelect={() => setIsOpen(false)}
                />
              ))}
            </div>

            <div className="bg-[#F3F7F3] px-4 py-2 text-xs text-[#59605A] flex items-center justify-between border-t border-[#E6ECE7]">
              <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border text-[10px]">Enter</kbd> to search all</span>
              <button
                type="button"
                onClick={() => executeSearch(query)}
                className="font-medium text-[#2F5D3A] hover:underline cursor-pointer"
              >
                View all results &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
