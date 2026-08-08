import { getEvents, getCategories } from "@/lib/mockApi";
import { BrowseEventsClient } from "@/components/BrowseEventsClient";

export const dynamic = 'force-dynamic';

export default async function BrowseEventsPage() {
  const [events, categories] = await Promise.all([
    getEvents(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <BrowseEventsClient initialEvents={events} categories={categories} />
    </div>
  );
}
