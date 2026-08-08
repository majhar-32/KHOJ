"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { simulateAISearch } from "@/lib/mockApi";

interface AISearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearch?: (query: string, parsedFilters: { category?: string; city?: string; mode?: "online" | "offline"; deadlineBefore?: string }) => void;
}

export function AISearchBar({ 
  initialValue = "", 
  placeholder = "Search for events, categories, or organizers...",
  className = "relative w-full",
  inputClassName = "py-4",
  onSearch
}: AISearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const parsedFilters = await simulateAISearch(query);
      
      if (onSearch) {
        // If controlled by parent (like BrowseEventsClient)
        onSearch(query, parsedFilters);
      } else {
        // If independent (like Landing Page)
        // We navigate to /events with the query. The Browse page will parse it again.
        // It's a bit redundant to parse twice, but it satisfies the requirement of 
        // showing the loading state on the landing page before navigating.
        router.push(`/events?q=${encodeURIComponent(query)}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isSearching ? (
          <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
        ) : (
          <Search className="h-5 w-5 text-neutral-400" />
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isSearching}
        className={`block w-full pl-11 pr-4 rounded-xl border border-neutral-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 disabled:opacity-70 disabled:bg-neutral-50 ${inputClassName}`}
      />
    </form>
  );
}
