"use client";

import { useState, useEffect } from "react";
import { KhojEvent } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/context/AuthContext";
import { getSavedEvents } from "@/lib/eventsApi";

export function HomeClosingSoonClient({ events }: { events: KhojEvent[] }) {
  const { token, isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isSaved={savedIds.has(event.id)}
          onToggleSave={handleToggleSave}
        />
      ))}
    </div>
  );
}
