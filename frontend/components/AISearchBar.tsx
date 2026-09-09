"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { searchEvents } from "@/lib/eventsApi";
import { KhojEvent } from "@/lib/types";

import { useAuth } from "@/context/AuthContext";

interface AISearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearch?: (query: string, results?: KhojEvent[]) => void;
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
  const { isAuthenticated } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      if (onSearch) {
        const results = await searchEvents(query);
        onSearch(query, results);
      } else {
        router.push(`/events?q=${encodeURIComponent(query)}`);
      }
    } catch {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/events?q=${encodeURIComponent(query)}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form role="search" onSubmit={handleSearch} className={className}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isSearching ? (
          <Sparkles className="h-5 w-5 text-accent animate-pulse" aria-hidden="true" />
        ) : (
          <Search className="h-5 w-5 text-text-muted" aria-hidden="true" />
        )}
      </div>
      <input
        type="search"
        aria-label="Search events"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isSearching}
        className={`block w-full pl-11 pr-4 rounded-xl border border-border-strong bg-bg-surface text-text-primary placeholder:text-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-70 disabled:bg-bg-surface-secondary ${inputClassName}`}
      />
    </form>
  );
}
