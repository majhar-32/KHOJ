"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";

export function HomeClosingSoonHeader() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleExploreAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/events");
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Closing Soon</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Upcoming events with registration deadlines approaching fast
        </p>
      </div>
      <button
        onClick={handleExploreAll}
        className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hidden sm:flex items-center gap-1 cursor-pointer"
      >
        Explore all <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
