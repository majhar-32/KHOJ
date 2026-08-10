"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { FilterX, X } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AISearchBar } from "@/components/AISearchBar";
import { simulateAISearch } from "@/lib/mockApi";

interface BrowseEventsClientProps {
  initialEvents: KhojEvent[];
  categories: string[];
}

export function BrowseEventsClient({ initialEvents, categories }: BrowseEventsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQ = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [deadlineBefore, setDeadlineBefore] = useState<string | null>(null);

  // AI parsed filters display state
  const [aiFilters, setAiFilters] = useState<{
    category?: string;
    city?: string;
    mode?: "online" | "offline";
    deadlineBefore?: string;
  }>({});
  const [hasAIFilters, setHasAIFilters] = useState(false);
  const [aiSearchDone, setAiSearchDone] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!initialQ);

  // Extract unique cities from events
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(initialEvents.map((e) => e.city)));
    return uniqueCities.sort();
  }, [initialEvents]);



  const handleAISearch = async (query: string) => {
    if (!query) return;
    
    setSearchQuery(query);
    const parsed = await simulateAISearch(query);
    
    // Update manual filter states so they stay in sync
    if (parsed.category) setSelectedCategory(parsed.category);
    if (parsed.city) setSelectedCity(parsed.city);
    if (parsed.mode) setSelectedMode(parsed.mode);
    if (parsed.deadlineBefore) setDeadlineBefore(parsed.deadlineBefore);
    
    setAiFilters(parsed);
    setHasAIFilters(Object.keys(parsed).length > 0);
    setAiSearchDone(true);
    setIsInitializing(false);

    // Update URL without triggering a full reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.replace(`/events?${params.toString()}`);
  };

  // Handle URL search on mount
  useEffect(() => {
    if (initialQ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleAISearch(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeAIFilter = (key: keyof typeof aiFilters) => {
    setAiFilters(prev => {
      const next = { ...prev };
      delete next[key];
      setHasAIFilters(Object.keys(next).length > 0);
      return next;
    });

    if (key === "category") setSelectedCategory("all");
    if (key === "city") setSelectedCity("all");
    if (key === "mode") setSelectedMode("all");
    if (key === "deadlineBefore") setDeadlineBefore(null);
  };

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const matchesSearch = 
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
  }, [initialEvents, searchQuery, selectedCategory, selectedMode, selectedCity, deadlineBefore]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedCity("all");
    setDeadlineBefore(null);
    setAiFilters({});
    setHasAIFilters(false);
    setAiSearchDone(false);
    
    // Clear URL query
    router.replace('/events');
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedMode !== "all" || selectedCity !== "all" || !!deadlineBefore;

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
              // If manual override, unmark AI chip
              if (aiFilters.category) removeAIFilter("category");
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
              if (aiFilters.mode) removeAIFilter("mode");
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
              if (aiFilters.city) removeAIFilter("city");
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

      {/* AI Parsed Chips */}
      {aiSearchDone && (
        <div className="mb-8 p-3 rounded-lg bg-primary-50 border border-primary-100 flex flex-wrap items-center gap-3">
          <span className="text-sm text-primary-900 font-medium">AI understood your search as:</span>
          
          {hasAIFilters ? (
            <div className="flex flex-wrap gap-2">
              {aiFilters.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-primary-700 shadow-sm border border-primary-200">
                  Category: {aiFilters.category}
                  <button aria-label="Remove category filter" onClick={() => removeAIFilter("category")} className="text-primary-400 hover:text-primary-600"><X className="w-3 h-3" aria-hidden="true" /></button>
                </span>
              )}
              {aiFilters.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-primary-700 shadow-sm border border-primary-200">
                  City: {aiFilters.city}
                  <button aria-label="Remove city filter" onClick={() => removeAIFilter("city")} className="text-primary-400 hover:text-primary-600"><X className="w-3 h-3" aria-hidden="true" /></button>
                </span>
              )}
              {aiFilters.mode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-primary-700 shadow-sm border border-primary-200">
                  Mode: {aiFilters.mode}
                  <button aria-label="Remove mode filter" onClick={() => removeAIFilter("mode")} className="text-primary-400 hover:text-primary-600"><X className="w-3 h-3" aria-hidden="true" /></button>
                </span>
              )}
              {aiFilters.deadlineBefore && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-primary-700 shadow-sm border border-primary-200">
                  Deadline before: {aiFilters.deadlineBefore}
                  <button aria-label="Remove deadline filter" onClick={() => removeAIFilter("deadlineBefore")} className="text-primary-400 hover:text-primary-600"><X className="w-3 h-3" aria-hidden="true" /></button>
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-neutral-600">No specific filters detected &mdash; showing keyword matches for &apos;{searchQuery}&apos;.</span>
          )}
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
            <EventCard key={event.id} event={event} />
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
