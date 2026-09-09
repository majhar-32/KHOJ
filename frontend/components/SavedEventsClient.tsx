"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { getSavedEvents } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/Button";
import { Bookmark, LogIn } from "lucide-react";
import Link from "next/link";

export function SavedEventsClient() {
  const searchParams = useSearchParams();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [savedEvents, setSavedEvents] = useState<KhojEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const events = await getSavedEvents(token);
      setSavedEvents(events);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSaved();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, token, authLoading, fetchSaved]);

  const [filter, setFilter] = useState<"all" | "registered">(() => {
    return searchParams.get("filter") === "registered" ? "registered" : "all";
  });

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "registered") {
      setFilter("registered");
    } else {
      setFilter("all");
    }
  }, [searchParams]);

  const handleToggleSave = (eventId: string, isNowSaved: boolean) => {
    if (!isNowSaved) {
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  const handleToggleRegister = (eventId: string, isNowRegistered: boolean) => {
    setSavedEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registered: isNowRegistered } : e))
    );
  };

  const registeredCount = savedEvents.filter((e) => e.registered).length;
  const displayedEvents =
    filter === "registered"
      ? savedEvents.filter((e) => e.registered)
      : savedEvents;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-page pb-20 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center text-text-muted">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-page pb-20 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="w-7 h-7 text-accent" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Saved Events</h1>
              <p className="text-text-secondary text-sm mt-0.5">Events you&apos;ve bookmarked for later</p>
            </div>
          </div>

          <div className="text-center py-20 bg-bg-surface rounded-2xl border border-border-default shadow-xs">
            <Bookmark className="w-10 h-10 text-text-muted mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text-primary mb-2">Log in to view saved events</h2>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Please sign in to your Khoj account to view and manage your bookmarked events.
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20 transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-accent" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {filter === "registered" ? "Registered Events" : "Saved Events"}
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {filter === "registered"
                ? "Events you have marked as registered"
                : "Events you've bookmarked for later"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-danger/30 bg-danger/15 px-4 py-3 text-sm text-danger font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 bg-bg-surface rounded-2xl border border-border-default text-text-muted">
            Loading your saved events...
          </div>
        ) : savedEvents.length === 0 ? (
          <div className="text-center py-20 bg-bg-surface rounded-2xl border border-border-default shadow-xs">
            <Bookmark className="w-10 h-10 text-text-muted mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text-primary mb-2">No saved events yet</h2>
            <p className="text-text-muted mb-6">
              Bookmark events while browsing to keep track of ones you&apos;re interested in.
            </p>
            <Link href="/events">
              <Button variant="secondary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Tabs & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="inline-flex rounded-xl border border-border-default bg-bg-surface-secondary p-1">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === "all"
                      ? "bg-bg-surface text-text-primary shadow-xs border border-border-default"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  All Saved ({savedEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("registered")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filter === "registered"
                      ? "bg-success text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Registered ({registeredCount})
                </button>
              </div>

              <Link href="/events" className="text-sm font-semibold text-accent hover:underline">
                Browse more →
              </Link>
            </div>

            {displayedEvents.length === 0 ? (
              <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-default">
                <p className="text-text-muted">
                  {filter === "registered"
                    ? "No saved events marked as registered yet. Check the 'Mark as Registered' button on any saved event to track it here!"
                    : "No events found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                    showRegisterToggle={true}
                    onToggleRegister={handleToggleRegister}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
