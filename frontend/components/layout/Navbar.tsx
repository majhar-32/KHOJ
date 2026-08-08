"use client";

import Link from "next/link";
import { Search, Bookmark, FlaskConical } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { Role } from "@/lib/types";

const roleLabels: Record<Role, string> = {
  user: "User",
  organizer: "Organizer",
  admin: "Admin",
};

export function Navbar() {
  const { role, setRole } = useRole();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-300/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-primary-600">
          Khoj
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-600">
          <Link href="/" className="hover:text-neutral-900">
            Browse
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            aria-label="Saved events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* DEV-ONLY role switcher — remove once real auth exists */}
          <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-2 py-1">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <label htmlFor="dev-role-switcher" className="sr-only">
              Preview as role (dev only)
            </label>
            <select
              id="dev-role-switcher"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-xs font-medium text-amber-800 focus:outline-none"
            >
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <option key={r} value={r}>
                  View as: {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
