"use client";

import { useState, useMemo } from "react";
import { KhojEvent } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { Search, FilterX } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface BrowseEventsClientProps {
  initialEvents: KhojEvent[];
  categories: string[];
}

export function BrowseEventsClient({ initialEvents, categories }: BrowseEventsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  // Extract unique cities from events
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(initialEvents.map((e) => e.city)));
    return uniqueCities.sort();
  }, [initialEvents]);
  
  const [selectedCity, setSelectedCity] = useState("all");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesMode = selectedMode === "all" || event.mode === selectedMode;
      const matchesCity = selectedCity === "all" || event.city === selectedCity;

      return matchesSearch && matchesCategory && matchesMode && matchesCity;
    });
  }, [initialEvents, searchQuery, selectedCategory, selectedMode, selectedCity]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedCity("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedMode !== "all" || selectedCity !== "all";

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Explore Events</h1>
        <p className="text-neutral-600">Discover and participate in upcoming opportunities.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search events or organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full sm:w-32"
          >
            <option value="all">Any Mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </Select>

          <Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
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

      {/* Results */}
      {filteredEvents.length > 0 ? (
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
