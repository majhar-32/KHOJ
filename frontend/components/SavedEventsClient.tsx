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

  const handleToggleSave = (eventId: string, isNowSaved: boolean) => {
    if (!isNowSaved) {
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center text-neutral-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="w-7 h-7 text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Saved Events</h1>
              <p className="text-neutral-600 text-sm mt-0.5">Events you&apos;ve bookmarked for later</p>
            </div>
          </div>

          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <Bookmark className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 mb-2">Log in to view saved events</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
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
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-primary-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Saved Events</h1>
            <p className="text-neutral-600 text-sm mt-0.5">Events you&apos;ve bookmarked for later</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 text-neutral-500">
            Loading your saved events...
          </div>
        ) : savedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <Bookmark className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 mb-2">No saved events yet</h2>
            <p className="text-neutral-500 mb-6">
              Bookmark events while browsing to keep track of ones you&apos;re interested in.
            </p>
            <Link href="/events">
              <Button variant="secondary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-600">
                {savedEvents.length} event{savedEvents.length !== 1 ? "s" : ""} saved
              </p>
              <Link href="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Browse more →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSaved={true}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
