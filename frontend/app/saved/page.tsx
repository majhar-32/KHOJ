import { getSavedEvents } from "@/lib/mockApi";
import { EventCard } from "@/components/EventCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Bookmark } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedEventsPage() {
  const savedEvents = await getSavedEvents();

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

        {savedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <Bookmark className="w-10 h-10 text-neutral-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-medium text-neutral-900 mb-2">No saved events yet</h2>
            <p className="text-neutral-500 mb-6">
              Bookmark events to keep track of ones you&apos;re interested in.
            </p>
            <Link href="/events">
              <Button variant="secondary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-600">{savedEvents.length} event{savedEvents.length !== 1 ? "s" : ""} saved</p>
              <Link href="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Browse more →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
