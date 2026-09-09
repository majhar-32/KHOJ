import { getEvents, getCategories } from "@/lib/eventsApi";
import { BrowseEventsClient } from "@/components/BrowseEventsClient";

import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function BrowseEventsPage() {
  let events: any[] = [];
  let categories: string[] = [];

  try {
    [events, categories] = await Promise.all([
      getEvents(),
      getCategories()
    ]);
  } catch (error) {
    console.error("Failed to load browse events data:", error);
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-primary transition-colors">
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading events...</div>}>
        <BrowseEventsClient initialEvents={events} categories={categories} />
      </Suspense>
    </div>
  );
}
