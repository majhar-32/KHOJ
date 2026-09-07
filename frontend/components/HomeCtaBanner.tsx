"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Rocket, ShieldCheck } from "lucide-react";

export function HomeCtaBanner() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/signup?role=organizer");
    } else if (role === "organizer") {
      router.push("/dashboard/organizer/submit");
    } else if (role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/organizer/submit");
    }
  };

  return (
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
          <button
            onClick={handleSubmitClick}
            className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors shadow-md cursor-pointer"
          >
            Submit New Event
          </button>
          <Link
            href="/signup?role=organizer"
            className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/10"
          >
            Create Organizer Account
          </Link>
        </div>
      </div>
    </div>
  );
}
