'use strict';

import React from 'react';
import Link from 'next/link';
import { SearchSuggestion as SearchSuggestionType } from '@/lib/domain/product';
import { Pill, ArrowRight, Tag } from 'lucide-react';

interface SearchSuggestionProps {
  suggestion: SearchSuggestionType;
  isActive: boolean;
  onSelect: (suggestion: SearchSuggestionType) => void;
}

export const SearchSuggestionItem: React.FC<SearchSuggestionProps> = ({
  suggestion,
  isActive,
  onSelect,
}) => {
  return (
    <Link
      href={`/medicines/${suggestion.slug}`}
      onClick={() => onSelect(suggestion)}
      className={`flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0 ${
        isActive ? 'bg-[#F3F7F3] text-[#111411]' : 'hover:bg-neutral-50 text-neutral-800'
      }`}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isActive ? 'bg-[#2F5D3A] text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {suggestion.type === 'product' ? (
            <Pill className="w-4 h-4" />
          ) : (
            <Tag className="w-4 h-4" />
          )}
        </div>
        <div className="truncate">
          <div className="text-sm font-medium text-[#111411] truncate">
            {suggestion.title}
          </div>
          <div className="text-xs text-[#59605A] truncate">{suggestion.subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-3 shrink-0">
        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
          {suggestion.category}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
      </div>
    </Link>
  );
};
