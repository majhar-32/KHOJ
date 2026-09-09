import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Khoj",
  description: "Privacy Policy explaining how Khoj handles user and event data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Privacy Policy
            </h1>
            <p className="text-xs text-text-muted">Last updated: March 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs space-y-3">
            <h2 className="text-base font-bold text-text-primary">1. Information We Collect</h2>
            <p>
              Khoj is designed with a privacy-first approach. When you register an account, we store basic profile details such as your name, email address, and account role (student/attendee or organizer). We do not collect sensitive payment data or physical addresses.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs space-y-3">
            <h2 className="text-base font-bold text-text-primary">2. Event Submissions & Public Listings</h2>
            <p>
              Event listings submitted by organizers—including titles, schedules, descriptions, registration URLs, and banners—are public by design. Organizers are responsible for ensuring that published contact information is intended for public consumption.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs space-y-3">
            <h2 className="text-base font-bold text-text-primary">3. Third-Party Links</h2>
            <p>
              Khoj directs attendees to external registration platforms (such as Google Forms, Eventbrite, or university websites). We are not responsible for the privacy practices or data collection policies of external third-party services.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-bg-surface border border-border-default shadow-xs space-y-3">
            <h2 className="text-base font-bold text-text-primary">4. Cookies & Preferences</h2>
            <p>
              We use local storage strictly for functional preferences (such as remembering your dark/light theme mode and keeping you authenticated). We do not deploy third-party advertising trackers or sell your personal data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
