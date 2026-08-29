import { getCategories, getEvents } from "@/lib/eventsApi";
import { HomeClosingSoonClient } from "@/components/HomeClosingSoonClient";
import { AISearchBar } from "@/components/AISearchBar";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: any[] = [];
  let categories: string[] = [];

  try {
    [events, categories] = await Promise.all([
      getEvents(),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Failed to load home page data:", error);
  }

  // Sort by nearest deadline, keeping only those in the future (or all, if we want to show closing soon)
  const now = new Date().getTime();
  const closingSoon = [...events]
    .filter((e) => new Date(e.registrationDeadline).getTime() > now)
    .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-neutral-200 pt-16 pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl mb-6">
            Discover Your Next <span className="text-primary-600">Opportunity</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Find hackathons, workshops, and contests happening across Bangladesh. Centralized in one place.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <AISearchBar />
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="px-4 sm:px-6 py-6 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex overflow-x-auto pb-4 -mb-4 hide-scrollbar gap-2 snap-x">
            {categories.map((category) => (
              <button
                key={category}
                className="snap-start shrink-0 px-4 py-2 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 text-sm font-medium hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Soon */}
      <section className="px-4 sm:px-6 py-12 mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Closing Soon</h2>
        </div>
        
        <HomeClosingSoonClient events={closingSoon} />
      </section>
    </div>
  );
}
