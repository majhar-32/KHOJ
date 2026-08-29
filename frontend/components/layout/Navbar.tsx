"use client";

import Link from "next/link";
import { Search, Bookmark, Clock, LayoutDashboard, Tags, Users, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { role, isAuthenticated } = useAuth();

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

          {/* Search shortcut */}
          <Link
            href="/"
            aria-label="Search events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 ml-2"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
