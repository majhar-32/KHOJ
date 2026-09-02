import { getCategories, getEvents } from "@/lib/eventsApi";
import { HomeClosingSoonClient } from "@/components/HomeClosingSoonClient";
import { HomeClosingSoonHeader } from "@/components/HomeClosingSoonHeader";
import { HomeCategoriesRow } from "@/components/HomeCategoriesRow";
import { HomeCtaBanner } from "@/components/HomeCtaBanner";
import { AISearchBar } from "@/components/AISearchBar";
import { Sparkles, Calendar, Building2, Tag, MapPin } from "lucide-react";

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

  // Calculate real live platform statistics
  const totalEvents = events.length;
  const totalCategories = categories.length;
  const uniqueOrganizers = new Set(events.map((e) => e.organizerName)).size;
  const uniqueCities = new Set(events.map((e) => e.city)).size;

  // Sort by nearest deadline in the future
  const now = new Date().getTime();
  const closingSoon = [...events]
    .filter((e) => new Date(e.registrationDeadline).getTime() > now)
    .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-section-bg border-b border-neutral-200/80 dark:border-neutral-800/80 pt-16 pb-16 px-4 sm:px-6 transition-colors">
        {/* Ambient Decorative Blur Blobs */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary-500/10 dark:bg-primary-600/15 blur-3xl rounded-full" aria-hidden="true" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span>Centralized Event & Contest Discovery Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl mb-6 leading-[1.15]">
            Discover Your Next <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 dark:from-primary-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">Opportunity</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find hackathons, workshops, debates, and tech contests happening across Bangladesh. Centralized in one powerful platform.
          </p>
          
          <div className="max-w-2xl mx-auto mb-12 relative group">
            <AISearchBar />
          </div>

          {/* Real Live Stats / Trust Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs transition-colors">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalEvents}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Live Events</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs transition-colors">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Tag className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalCategories}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Categories</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs transition-colors">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{uniqueOrganizers}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Organizers</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs transition-colors">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{uniqueCities}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Functional Categories Row with Auth Guard */}
      <section className="px-4 sm:px-6 py-6 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 transition-colors">
        <HomeCategoriesRow categories={categories} />
      </section>

      {/* Closing Soon Section */}
      <section className="px-4 sm:px-6 py-12 mx-auto max-w-[1280px]">
        <HomeClosingSoonHeader />
        <HomeClosingSoonClient events={closingSoon} />
      </section>

      {/* Secondary Section: "Are You an Organizer?" CTA Banner */}
      <section className="px-4 sm:px-6 py-8 mx-auto max-w-[1280px]">
        <HomeCtaBanner />
      </section>
    </div>
  );
}
