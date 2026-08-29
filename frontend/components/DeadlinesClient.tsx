"use client";

import { useState, useEffect, useCallback } from "react";
import { KhojEvent } from "@/lib/types";
import { getSavedEvents } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";
import { DeadlineBadge, CategoryTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, ExternalLink, LogIn } from "lucide-react";
import Link from "next/link";

function groupByDeadline(events: KhojEvent[]) {
  const now = new Date().getTime();
  const in24h = now + 24 * 60 * 60 * 1000;
  const in7d = now + 7 * 24 * 60 * 60 * 1000;
  const in30d = now + 30 * 24 * 60 * 60 * 1000;

  const upcoming = events.filter((e) => new Date(e.registrationDeadline).getTime() > now);
  upcoming.sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime());

  return {
    "Closing in 24 hours": upcoming.filter((e) => new Date(e.registrationDeadline).getTime() <= in24h),
    "This week": upcoming.filter((e) => {
      const t = new Date(e.registrationDeadline).getTime();
      return t > in24h && t <= in7d;
    }),
    "This month": upcoming.filter((e) => {
      const t = new Date(e.registrationDeadline).getTime();
      return t > in7d && t <= in30d;
    }),
    "Later": upcoming.filter((e) => new Date(e.registrationDeadline).getTime() > in30d),
  };
}

export function DeadlinesClient() {
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="max-w-[1024px] mx-auto px-4 py-16 text-center text-neutral-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="max-w-[1024px] mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-7 h-7 text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Upcoming Deadlines</h1>
              <p className="text-neutral-600 text-sm mt-0.5">Registration deadlines for your saved events</p>
            </div>
          </div>

          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 mb-2">Log in to view upcoming deadlines</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Please sign in to track upcoming registration deadlines for your bookmarked events.
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

  const groups = groupByDeadline(savedEvents);
  const hasAny = Object.values(groups).some((g) => g.length > 0);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="max-w-[1024px] mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-7 h-7 text-primary-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Upcoming Deadlines</h1>
            <p className="text-neutral-600 text-sm mt-0.5">Registration deadlines for your saved events</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 text-neutral-500">
            Loading upcoming deadlines...
          </div>
        ) : !hasAny ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 mb-2">No upcoming deadlines</h2>
            <p className="text-neutral-500 mb-6">
              Save events to track their registration deadlines here.
            </p>
            <Link href="/events">
              <Button variant="secondary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {(Object.entries(groups) as [string, typeof savedEvents][]).map(([label, items]) =>
              items.length === 0 ? null : (
                <section key={label}>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-3">{label}</h2>
                  <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                    {items.map((event) => {
                      const daysLeft = Math.ceil(
                        (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                      );
                      return (
                        <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/events/${event.id}`}
                              className="font-medium text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1"
                            >
                              {event.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <CategoryTag label={event.category} />
                              <span className="text-xs text-neutral-500">
                                {new Date(event.registrationDeadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <DeadlineBadge daysLeft={daysLeft} />
                            {event.registrationLink && (
                              <Link
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="secondary">
                                  Register
                                  <ExternalLink className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
