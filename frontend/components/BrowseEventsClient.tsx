"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { FilterX, X, Sparkles } from "lucide-react";
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
  const { token, isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  
  const initialQ = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [deadlineBefore, setDeadlineBefore] = useState<string | null>(null);

  // Real AI search results
  const [aiSearchResults, setAiSearchResults] = useState<KhojEvent[] | null>(null);
  const [aiSearchDone, setAiSearchDone] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!initialQ);

  // Extract unique cities from events
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(initialEvents.map((e) => e.city)));
    return uniqueCities.sort();
  }, [initialEvents]);

  const handleAISearch = async (query: string, directResults?: KhojEvent[]) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setIsInitializing(true);

    try {
      const results = directResults || (await searchEvents(query));
      setAiSearchResults(results);
      setAiSearchDone(true);
    } catch {
      setAiSearchResults(null);
      setAiSearchDone(true);
    } finally {
      setIsInitializing(false);
    }

    // Update URL without triggering a full reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.replace(`/events?${params.toString()}`);
  };

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

  // Handle URL search on mount
  useEffect(() => {
    if (initialQ) {
      handleAISearch(initialQ);
    }
  }, []);

  const filteredEvents = useMemo(() => {
    const baseList = aiSearchResults !== null ? aiSearchResults : initialEvents;
    return baseList.filter((event) => {
      const matchesSearch = 
        aiSearchResults !== null ||
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesMode = selectedMode === "all" || event.mode === selectedMode;
      const matchesCity = selectedCity === "all" || event.city === selectedCity;
      
      let matchesDeadline = true;
      if (deadlineBefore) {
        matchesDeadline = new Date(event.registrationDeadline).getTime() <= new Date(deadlineBefore).getTime();
      }

      return matchesSearch && matchesCategory && matchesMode && matchesCity && matchesDeadline;
    });
  }, [initialEvents, aiSearchResults, searchQuery, selectedCategory, selectedMode, selectedCity, deadlineBefore]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedCity("all");
    setDeadlineBefore(null);
    setAiSearchResults(null);
    setAiSearchDone(false);
    
    // Clear URL query
    router.replace('/events');
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedMode !== "all" || selectedCity !== "all" || !!deadlineBefore || aiSearchResults !== null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Explore Events</h1>
        <p className="text-neutral-600">Discover and participate in upcoming opportunities.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1">
          <AISearchBar 
            initialValue={searchQuery}
            onSearch={(q) => handleAISearch(q)} 
            inputClassName="py-2.5" 
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setAiSearchResults(null);
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
              setAiSearchResults(null);
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
              setAiSearchResults(null);
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
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto text-neutral-600 hover:text-neutral-900">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* AI Search Indicator */}
      {aiSearchDone && searchQuery && (
        <div className="mb-8 p-3 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <span className="text-sm text-primary-900 font-medium">
              AI search results for &ldquo;{searchQuery}&rdquo; ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found)
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium underline"
          >
            Reset search
          </button>
        </div>
      )}

      {/* Results */}
      {isInitializing ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
          <p className="text-primary-600 font-medium">Analyzing search query...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
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
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
          <p className="text-neutral-500 mb-6">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          <Button onClick={clearFilters} variant="secondary">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
