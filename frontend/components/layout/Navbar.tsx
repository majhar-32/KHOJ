"use client";

import Link from "next/link";
import { Search, Bookmark, Clock, FlaskConical, LayoutDashboard, Tags, Users, User } from "lucide-react";
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
          <Link href="/events" className="hover:text-neutral-900">Browse</Link>
          {role === "organizer" && (
            <Link href="/dashboard/organizer" className="hover:text-neutral-900">My Events</Link>
          )}
          {role === "admin" && (
            <>
              <Link href="/dashboard/admin" className="hover:text-neutral-900">Events</Link>
              <Link href="/dashboard/admin/categories" className="flex items-center gap-1 hover:text-neutral-900">
                <Tags className="w-3.5 h-3.5" aria-hidden="true" />
                Categories
              </Link>
              <Link href="/dashboard/admin/users" className="flex items-center gap-1 hover:text-neutral-900">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                Users
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Organizer dashboard shortcut */}
          {role === "organizer" && (
            <Link
              href="/dashboard/organizer"
              aria-label="Organizer dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          <Link
            href="/saved"
            aria-label="Saved events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/deadlines"
            aria-label="Upcoming deadlines"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Fake search button (Landing page has the real search bar) */}
          <Link
            href="/"
            aria-label="Search events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* User Profile */}
          <Link
            href="/profile"
            aria-label="User profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 ml-2"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* DEV-ONLY role switcher — remove once real auth exists */}
          <div className="ml-2 flex items-center gap-1.5 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-2 py-1">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <label htmlFor="dev-role-switcher" className="sr-only">Preview as role (dev only)</label>
            <select
              id="dev-role-switcher"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-xs font-medium text-amber-800 focus:outline-none"
            >
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <option key={r} value={r}>View as: {roleLabels[r]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
