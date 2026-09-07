"use client";

import { useState, useEffect, useCallback } from "react";
import { KhojEvent } from "@/lib/types";
import { getSavedEvents } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/Button";
import { Bookmark, LogIn } from "lucide-react";
import Link from "next/link";

export function SavedEventsClient() {
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

  const [filter, setFilter] = useState<"all" | "registered">("all");

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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center text-neutral-500 dark:text-neutral-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="w-7 h-7 text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Saved Events</h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">Events you&apos;ve bookmarked for later</p>
            </div>
          </div>

          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Bookmark className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Log in to view saved events</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-primary-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Saved Events</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">Events you&apos;ve bookmarked for later</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error-300 bg-error-50 dark:bg-error-950/40 px-4 py-3 text-sm text-error-700 dark:text-error-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            Loading your saved events...
          </div>
        ) : savedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Bookmark className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No saved events yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
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
              <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    filter === "all"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  All Saved ({savedEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("registered")}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filter === "registered"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Registered ({registeredCount})
                </button>
              </div>

              <Link href="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Browse more →
              </Link>
            </div>

            {displayedEvents.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-500 dark:text-neutral-400">
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
