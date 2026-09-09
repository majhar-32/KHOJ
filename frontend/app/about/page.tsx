import Link from "next/link";
import { ArrowLeft, Sparkles, Target, Compass, Users2, ExternalLink } from "lucide-react";

export const metadata = {
  title: "About Khoj — Centralized Event & Contest Discovery",
  description: "Learn about Khoj, our mission to unify event discovery in Bangladesh, and how the platform works.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            About Khoj
          </h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            A centralized platform built to solve event discovery fragmentation for students, tech enthusiasts, and university clubs across Bangladesh.
          </p>
        </div>

        {/* The Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">The Challenge</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Every week, brilliant hackathons, research conferences, math olympiads, and cultural fests are announced. However, opportunities remain scattered across random Facebook groups, private Discord servers, LinkedIn feeds, and physical campus notice boards. Students frequently miss deadlines simply because they never saw the announcement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">The Khoj Solution</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Khoj bridges this gap by offering a single, searchable discovery hub. Students can filter opportunities by category, city, eligibility, and submission deadlines. Organizers get a streamlined portal to broadcast their initiatives to ambitious talent nationwide.
            </p>
          </div>
        </div>

        {/* Discovery Platform Model */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-primary-950 text-white border border-neutral-800 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users2 className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold">Discovery-First Architecture</h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed mb-6">
            Khoj is strictly an open discovery and aggregation engine. We do not gatekeep or handle ticketing transactions. Every event card links directly to the organizer’s official registration form (Google Form, website, or portal), giving organizers complete control over their participants.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors"
            >
              <span>Explore Active Events</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
