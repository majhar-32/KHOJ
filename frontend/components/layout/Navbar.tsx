"use client";

import Link from "next/link";
import { Search, Bookmark, Clock, LayoutDashboard, Tags, Users, User, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export function Navbar() {
  const { role, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-300/70 bg-white/90 dark:bg-neutral-900/90 dark:border-neutral-800 backdrop-blur transition-colors">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-primary-600 dark:text-primary-500">
          Khoj
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-600 dark:text-neutral-300">
          <Link href="/events" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Browse</Link>
          {role === "organizer" && (
            <Link href="/dashboard/organizer" className="hover:text-neutral-900 dark:hover:text-white transition-colors">My Events</Link>
          )}
          {role === "admin" && (
            <>
              <Link href="/dashboard/admin" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Manage Events</Link>
              <Link href="/dashboard/admin/categories" className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <Tags className="w-3.5 h-3.5" aria-hidden="true" />
                Categories
              </Link>
              <Link href="/dashboard/admin/users" className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                Users
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Role Dashboard Shortcut (Admin / Organizer) */}
          {isAuthenticated && (role === "admin" || role === "organizer") && (
            <Link
              href={role === "admin" ? "/dashboard/admin" : "/dashboard/organizer"}
              aria-label={role === "admin" ? "Admin dashboard" : "Organizer dashboard"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          <Link
            href="/saved"
            aria-label="Saved events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/deadlines"
            aria-label="Upcoming deadlines"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Search shortcut */}
          <Link
            href="/"
            aria-label="Search events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-2"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 dark:bg-primary-950 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
