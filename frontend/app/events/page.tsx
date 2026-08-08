import { getEvents, getCategories } from "@/lib/mockApi";
import { BrowseEventsClient } from "@/components/BrowseEventsClient";

import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function BrowseEventsPage() {
  const [events, categories] = await Promise.all([
    getEvents(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<div className="p-8 text-center">Loading events...</div>}>
        <BrowseEventsClient initialEvents={events} categories={categories} />
      </Suspense>
    </div>
  );
}
