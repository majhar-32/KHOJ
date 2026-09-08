"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bookmark, Clock, LayoutDashboard, Tags, Users, User, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function getInitials(userName?: string) {
  if (!userName) return "U";
  const parts = userName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function Navbar() {
  const router = useRouter();
  const { role, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleProtectedClick = (e: React.MouseEvent, targetUrl: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-300/70 bg-white/90 dark:bg-neutral-900/90 dark:border-neutral-800 backdrop-blur transition-colors">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-primary-600 dark:text-primary-500">
          Khoj
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {isAuthenticated ? (
            <Link href="/events" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Browse</Link>
          ) : (
            <button
              onClick={(e) => handleProtectedClick(e, "/events")}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors text-left font-medium"
            >
              Browse
            </button>
          )}

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

        {/* Right Icon Cluster with Visual Grouping */}
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
              <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
            )}
          </button>

          {/* Visual Divider 1 */}
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" aria-hidden="true" />

          {/* Action Icon Group */}
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

          {/* Saved Events Shortcut */}
          <button
            onClick={(e) => handleProtectedClick(e, "/saved")}
            aria-label="Saved events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Deadlines Shortcut */}
          <button
            onClick={(e) => handleProtectedClick(e, "/deadlines")}
            aria-label="Upcoming deadlines"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Search Shortcut */}
          <button
            onClick={(e) => handleProtectedClick(e, "/events")}
            aria-label="Search events"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Visual Divider 2 */}
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" aria-hidden="true" />

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name || "User profile"}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center select-none shadow-2xs border border-primary-400/30 dark:border-primary-500/30">
                  {getInitials(user?.name)}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Log in"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
