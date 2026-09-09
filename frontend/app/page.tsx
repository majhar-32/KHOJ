import Link from "next/link";
import { getCategories, getEvents } from "@/lib/eventsApi";
import { HomeClosingSoonClient } from "@/components/HomeClosingSoonClient";
import { AISearchBar } from "@/components/AISearchBar";
import { Sparkles, Calendar, Building2, Tag, MapPin, ArrowRight } from "lucide-react";
import { HomeCtaBanner } from "@/components/HomeCtaBanner";

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
    <div className="min-h-screen bg-bg-page text-text-primary transition-colors pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/10 via-bg-surface to-bg-page border-b border-border-default pt-16 pb-16 px-4 sm:px-6">
        {/* Ambient Decorative Blur Blobs */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-full max-w-4xl h-64 bg-accent/10 blur-3xl rounded-full" aria-hidden="true" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
            <span>Centralized Event & Contest Discovery Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-6xl mb-6 leading-[1.15]">
            Discover Your Next <span className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">Opportunity</span>
          </h1>
          <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Find hackathons, workshops, debates, and tech contests happening across Bangladesh. Centralized in one powerful platform.
          </p>

          <div className="max-w-2xl mx-auto mb-12 relative group">
            <AISearchBar />
          </div>

          {/* Real Live Stats / Trust Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-bg-surface border border-accent/20 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-accent/40 transition-all group">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-accent/15 text-accent border border-accent/30 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{totalEvents}</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">Live Events</p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-surface border border-warning/20 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-warning/40 transition-all group">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-warning/15 text-warning border border-warning/30 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{totalCategories}</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">Categories</p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-surface border border-indigo-500/20 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all group">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{uniqueOrganizers}</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">Organizers</p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-surface border border-success/20 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-success/40 transition-all group">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-success/15 text-success border border-success/30 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{uniqueCities}</p>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Functional Categories Row */}
      <section className="px-4 sm:px-6 py-6 border-b border-border-default bg-bg-surface transition-colors">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Browse by Category
            </h2>
            <Link
              href="/events"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              All Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 snap-x">
            <Link
              href="/events"
              className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent/40 bg-accent/15 text-accent text-sm font-semibold hover:bg-accent/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>All Categories</span>
            </Link>

            {categories.map((category) => (
              <Link
                key={category}
                href={`/events?category=${encodeURIComponent(category)}`}
                className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border-default bg-bg-surface-secondary text-text-secondary text-sm font-medium hover:border-accent hover:text-accent hover:bg-bg-surface transition-all duration-200 shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Tag className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                <span>{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Soon Section */}
      <section className="px-4 sm:px-6 py-12 mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Closing Soon</h2>
            <p className="text-sm text-text-secondary mt-1">
              Upcoming events with registration deadlines approaching fast
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-accent hover:underline hidden sm:flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <HomeClosingSoonClient events={closingSoon} />
      </section>

      {/* Secondary Section: "Are You an Organizer?" CTA Banner */}
      <section className="px-4 sm:px-6 py-8 mx-auto max-w-[1280px]">
        <HomeCtaBanner />
      </section>
    </div>
  );
}
