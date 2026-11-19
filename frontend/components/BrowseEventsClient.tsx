"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { FilterX, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AISearchBar } from "@/components/AISearchBar";
import { getSavedEvents, searchEvents } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";

interface BrowseEventsClientProps {
  initialEvents: KhojEvent[];
  categories: string[];
}

export function BrowseEventsClient({ initialEvents, categories }: BrowseEventsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialAI = searchParams.get("ai") === "true";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [deadlineBefore, setDeadlineBefore] = useState<string | null>(null);

  // AI search state — OFF by default for fast, instantaneous searching
  const [isAISearchActive, setIsAISearchActive] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<KhojEvent[] | null>(null);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Extract unique cities from events
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(initialEvents.map((e) => e.city).filter(Boolean)));
    return uniqueCities.sort();
  }, [initialEvents]);

  // Fast standard search handler — updates query instantly in memory
  const handleNormalSearch = (query: string) => {
    setSearchQuery(query);
    if (isAISearchActive) {
      setIsAISearchActive(false);
      setAiSearchResults(null);
    }
    setAiNotice(null);

    // Sync URL smoothly without reload
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) {
      params.set("q", query.trim());
      params.delete("ai");
    } else {
      params.delete("q");
      params.delete("ai");
    }
    const newUrl = params.toString() ? `/events?${params.toString()}` : "/events";
    router.replace(newUrl, { scroll: false });
  };

  // Optional AI Search handler — only triggered when user explicitly asks for it
  const handleAISearch = async (queryToSearch = searchQuery) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsAISearching(true);
    setAiNotice(null);

    try {
      const results = await searchEvents(q);
      setAiSearchResults(results);
      setIsAISearchActive(true);
      setAiNotice(`AI analyzed "${q}" and found ${results.length} relevant event${results.length === 1 ? "" : "s"}.`);
    } catch {
      // Graceful fallback to fast standard search
      setIsAISearchActive(false);
      setAiSearchResults(null);
      setAiNotice("AI search took longer than expected. Showing fast standard keyword results.");
    } finally {
      setIsAISearching(false);
    }

    const params = new URLSearchParams(window.location.search);
    params.set("q", q);
    params.set("ai", "true");
    router.replace(`/events?${params.toString()}`, { scroll: false });
  };

  const resetToStandardSearch = () => {
    setIsAISearchActive(false);
    setAiSearchResults(null);
    setAiNotice(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("ai");
    router.replace(params.toString() ? `/events?${params.toString()}` : "/events", { scroll: false });
  };

  // Only trigger AI search on initial mount IF URL explicitly had ?ai=true
  useEffect(() => {
    if (initialAI && initialQ) {
      handleAISearch(initialQ);
    }
  }, []);

  // Redirect unauthenticated visitors to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch user's saved events if logged in
  useEffect(() => {
    if (isAuthenticated && token) {
      getSavedEvents(token)
        .then((savedEvents) => {
          setSavedIds(new Set(savedEvents.map((e) => e.id)));
        })
        .catch(() => {});
    } else {
      setSavedIds(new Set());
    }
  }, [isAuthenticated, token]);

  const handleToggleSave = (eventId: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  // Instant in-memory filtering (0ms latency, runs synchronously)
  const filteredEvents = useMemo(() => {
    const baseList = isAISearchActive && aiSearchResults !== null ? aiSearchResults : initialEvents;
    const q = searchQuery.trim().toLowerCase();

    return baseList.filter((event) => {
      const matchesSearch =
        (isAISearchActive && aiSearchResults !== null) ||
        !q ||
        (event.name && event.name.toLowerCase().includes(q)) ||
        (event.organizerName && event.organizerName.toLowerCase().includes(q)) ||
        (event.category && event.category.toLowerCase().includes(q)) ||
        (event.city && event.city.toLowerCase().includes(q)) ||
        (event.venue && event.venue.toLowerCase().includes(q)) ||
        (event.description && event.description.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesMode = selectedMode === "all" || event.mode === selectedMode;
      const matchesCity = selectedCity === "all" || event.city === selectedCity;

      let matchesDeadline = true;
      if (deadlineBefore) {
        matchesDeadline = new Date(event.registrationDeadline).getTime() <= new Date(deadlineBefore).getTime();
      }

      return matchesSearch && matchesCategory && matchesMode && matchesCity && matchesDeadline;
    });
  }, [initialEvents, isAISearchActive, aiSearchResults, searchQuery, selectedCategory, selectedMode, selectedCity, deadlineBefore]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedCity("all");
    setDeadlineBefore(null);
    setIsAISearchActive(false);
    setAiSearchResults(null);
    setAiNotice(null);
    router.replace("/events");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedMode !== "all" ||
    selectedCity !== "all" ||
    !!deadlineBefore ||
    isAISearchActive;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Explore Events</h1>
        <p className="text-text-secondary">Discover and participate in upcoming opportunities.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Fast Standard Search Bar with optional AI Search button */}
        <div className="flex-1">
          <AISearchBar
            initialValue={searchQuery}
            onSearch={handleNormalSearch}
            onAISearch={handleAISearch}
            isAISearching={isAISearching}
            inputClassName="py-2.5"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (isAISearchActive) setIsAISearchActive(false);
            }}
            className="w-full sm:w-40"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Select
            value={selectedMode}
            onChange={(e) => {
              setSelectedMode(e.target.value);
              if (isAISearchActive) setIsAISearchActive(false);
            }}
            className="w-full sm:w-32"
          >
            <option value="all">Any Mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </Select>

          <Select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              if (isAISearchActive) setIsAISearchActive(false);
            }}
            className="w-full sm:w-36"
            disabled={selectedMode === "online"}
          >
            <option value="all">Any City</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto text-text-secondary hover:text-text-primary">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* AI Search Loading State */}
      {isAISearching && (
        <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />
          <p className="text-sm text-text-primary font-medium">
            AI is analyzing your natural language query: &ldquo;{searchQuery}&rdquo;...
          </p>
        </div>
      )}

      {/* AI Search Active Banner */}
      {isAISearchActive && (
        <div className="mb-6 p-3.5 rounded-xl bg-accent/15 border border-accent/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <span className="text-sm text-text-primary font-medium">
              {aiNotice || `AI Smart Search active for "${searchQuery}"`} ({filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found)
            </span>
          </div>
          <button
            onClick={resetToStandardSearch}
            className="text-xs text-accent hover:underline font-semibold whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            Switch to Standard Fast Search
          </button>
        </div>
      )}

      {/* Results */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSaved={savedIds.has(event.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-surface rounded-2xl border border-border-default">
          <h3 className="text-lg font-bold text-text-primary mb-2">No events found</h3>
          <p className="text-text-muted mb-6">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          <Button onClick={clearFilters} variant="secondary">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
