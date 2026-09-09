"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Rocket, ShieldCheck, Info } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

export function HomeCtaBanner() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/signup?role=organizer");
    } else if (role === "organizer") {
      router.push("/dashboard/organizer/submit");
    } else {
      // Logged in as USER or ADMIN
      setToast("Only organizer accounts can submit events — create one below");
      router.push("/signup?role=organizer");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bg-surface via-bg-surface to-accent/15 text-text-primary p-8 sm:p-12 border border-border-default shadow-xl">
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-accent/20 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold mb-4 backdrop-blur">
          <Rocket className="w-3.5 h-3.5" aria-hidden="true" />
          <span>For Event Hosts & Organizations</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-4">
          Host Your Next Event on Khoj
        </h2>
        <p className="text-text-secondary text-sm sm:text-base mb-8 leading-relaxed">
          Reach thousands of students, developers, designers, and competitive thinkers across Bangladesh. Submit your event listing for review in under 2 minutes with automated AI parsing.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-default">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Instant AI Parsing</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-default">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Organized Review Queue</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-default">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Nationwide Reach</span>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmitClick}
              className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              Submit New Event
            </button>
            <Link
              href="/signup?role=organizer"
              className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-bg-surface-secondary hover:bg-border-default text-text-primary font-semibold text-sm transition-colors border border-border-default"
            >
              Create Organizer Account
            </Link>
          </div>

          {isAuthenticated && role !== "organizer" && (
            <p className="mt-3 text-xs text-amber-300/90 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Only organizer accounts can submit events — create one below.</span>
            </p>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
