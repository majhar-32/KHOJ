import Link from "next/link";
import { ArrowLeft, Sparkles, Target, Compass, Users2, ExternalLink } from "lucide-react";

export const metadata = {
  title: "About Khoj — Centralized Event & Contest Discovery",
  description: "Learn about Khoj, our mission to unify event discovery in Bangladesh, and how the platform works.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            About Khoj
          </h1>
          <p className="mt-3 text-lg text-text-secondary leading-relaxed">
            A centralized platform built to solve event discovery fragmentation for students, tech enthusiasts, and university clubs across Bangladesh.
          </p>
        </div>

        {/* The Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center text-warning mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">The Challenge</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every week, brilliant hackathons, research conferences, math olympiads, and cultural fests are announced. However, opportunities remain scattered across random Facebook groups, private Discord servers, LinkedIn feeds, and physical campus notice boards. Students frequently miss deadlines simply because they never saw the announcement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">The Khoj Solution</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Khoj bridges this gap by offering a single, searchable discovery hub. Students can filter opportunities by category, city, eligibility, and submission deadlines. Organizers get a streamlined portal to broadcast their initiatives to ambitious talent nationwide.
            </p>
          </div>
        </div>

        {/* Discovery Platform Model */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-bg-surface via-bg-surface to-accent/15 text-text-primary border border-border-default mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users2 className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">Discovery-First Architecture</h2>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Khoj is strictly an open discovery and aggregation engine. We do not gatekeep or handle ticketing transactions. Every event card links directly to the organizer’s official registration form (Google Form, website, or portal), giving organizers complete control over their participants.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm"
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
