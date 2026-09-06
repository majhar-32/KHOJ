import Link from "next/link";
import { getCategories, getEvents } from "@/lib/eventsApi";
import { HomeClosingSoonClient } from "@/components/HomeClosingSoonClient";
import { AISearchBar } from "@/components/AISearchBar";
import { Sparkles, Calendar, Building2, Tag, MapPin, ArrowRight, Rocket, ShieldCheck } from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-neutral-50 dark:from-neutral-900/90 dark:via-neutral-950 dark:to-neutral-950 border-b border-neutral-200/80 dark:border-neutral-800/80 pt-16 pb-16 px-4 sm:px-6">
        {/* Ambient Decorative Blur Blobs */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary-500/10 dark:bg-primary-500/15 blur-3xl rounded-full" aria-hidden="true" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/80 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span>Centralized Event & Contest Discovery Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl mb-6 leading-[1.15]">
            Discover Your Next <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Opportunity</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find hackathons, workshops, debates, and tech contests happening across Bangladesh. Centralized in one powerful platform.
          </p>

          <div className="max-w-2xl mx-auto mb-12 relative group">
            <AISearchBar />
          </div>

          {/* Real Live Stats / Trust Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur text-center shadow-xs">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalEvents}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Live Events</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur text-center shadow-xs">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Tag className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalCategories}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Categories</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur text-center shadow-xs">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{uniqueOrganizers}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Organizers</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur text-center shadow-xs">
              <div className="flex justify-center mb-1.5 text-primary-600 dark:text-primary-400">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{uniqueCities}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Functional Categories Row */}
      <section className="px-4 sm:px-6 py-6 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Browse by Category
            </h2>
            <Link
              href="/events"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
            >
              All Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 snap-x">
            <Link
              href="/events"
              className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span>All Categories</span>
            </Link>

            {categories.map((category) => (
              <Link
                key={category}
                href={`/events?category=${encodeURIComponent(category)}`}
                className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Tag className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
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
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Closing Soon</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Upcoming events with registration deadlines approaching fast
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hidden sm:flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <HomeClosingSoonClient events={closingSoon} />
      </section>

      {/* Secondary Section: "Are You an Organizer?" CTA Banner */}
      <section className="px-4 sm:px-6 py-8 mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-primary-950 text-white p-8 sm:p-12 border border-neutral-800 shadow-xl">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-primary-600/20 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-semibold mb-4 backdrop-blur">
              <Rocket className="w-3.5 h-3.5" aria-hidden="true" />
              <span>For Event Hosts & Organizations</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Host Your Next Event on Khoj
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mb-8 leading-relaxed">
              Reach thousands of students, developers, designers, and competitive thinkers across Bangladesh. Submit your event listing for review in under 2 minutes with automated AI parsing.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs text-neutral-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                <span>Instant AI Parsing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                <span>Organized Review Queue</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                <span>Nationwide Reach</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/organizer/submit"
                className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors shadow-md"
              >
                Submit New Event
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/10"
              >
                Create Organizer Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
