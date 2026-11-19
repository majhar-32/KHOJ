"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AISearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearch?: (query: string) => void;
  onAISearch?: (query: string) => void;
  isAISearching?: boolean;
}

export function AISearchBar({
  initialValue = "",
  placeholder = "Search events, categories, organizers, or cities...",
  className = "relative w-full",
  inputClassName = "py-3.5",
  onSearch,
  onAISearch,
  isAISearching = false,
}: AISearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleNormalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const q = query.trim();
    if (onSearch) {
      onSearch(q);
    } else {
      router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
    }
  };

  const handleTriggerAISearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const q = query.trim();
    if (!q) return;

    if (onAISearch) {
      onAISearch(q);
    } else {
      router.push(`/events?q=${encodeURIComponent(q)}&ai=true`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <form role="search" onSubmit={handleNormalSearch} className={className}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isAISearching ? (
            <Loader2 className="h-5 w-5 text-accent animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5 text-text-muted" aria-hidden="true" />
          )}
        </div>

        <input
          type="search"
          aria-label="Search events"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className={`block w-full pl-11 pr-32 sm:pr-40 rounded-xl border border-border-strong bg-bg-surface text-text-primary placeholder:text-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all ${inputClassName}`}
        />

        <div className="absolute right-2 inset-y-0 flex items-center gap-1.5 py-1.5">
          {/* Optional AI Search Trigger Button */}
          <button
            type="button"
            onClick={handleTriggerAISearch}
            disabled={!query.trim() || isAISearching}
            title="Ask AI to find matching events with natural language"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">AI Search</span>
          </button>

          {/* Normal Fast Search Submit Button */}
          <button
            type="submit"
            className="inline-flex items-center justify-center p-2 rounded-lg bg-primary hover:bg-primary/90 text-text-onPrimary transition-colors cursor-pointer shadow-xs"
            title="Normal Search"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
