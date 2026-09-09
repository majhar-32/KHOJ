"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  LayoutDashboard,
  Tags,
  Users,
  Menu,
  X,
} from "lucide-react";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filterParam = searchParams.get("filter");

  const isAllEventsActive = pathname === "/events" || pathname.startsWith("/events/");
  const isSavedActive = pathname === "/saved" && filterParam !== "registered";
  const isRegisteredActive = pathname === "/saved" && filterParam === "registered";

  const handleProtectedClick = (e: React.MouseEvent, targetUrl: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-bg-surface/95 backdrop-blur transition-colors">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* LEFT SIDE: Brand Logo + Khoj Text ONLY */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="inline-flex items-center gap-2 sm:gap-2.5 text-accent group shrink-0"
        >
          <div className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-lg overflow-hidden shadow-xs border border-accent/20 group-hover:border-accent/40 transition-colors shrink-0">
            <Image
              src="/logo.png"
              alt="Khoj Logo"
              width={34}
              height={34}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-2xl sm:text-[1.65rem] font-black tracking-tight leading-none text-accent group-hover:opacity-95 transition-opacity">
            Khoj
          </span>
        </Link>

        {/* RIGHT SIDE: Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 mr-2">
            {/* 1. All Events (visible to everyone) */}
            <button
              onClick={(e) => handleProtectedClick(e, "/events")}
              className={`text-[15px] transition-all cursor-pointer ${
                isAllEventsActive
                  ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                  : "text-text-primary hover:text-accent font-medium"
              }`}
            >
              All Events
            </button>

            {/* 2. Saved Events (visible to everyone) */}
            <button
              onClick={(e) => handleProtectedClick(e, "/saved")}
              className={`text-[15px] transition-all cursor-pointer ${
                isSavedActive
                  ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                  : "text-text-primary hover:text-accent font-medium"
              }`}
            >
              Saved Events
            </button>

            {/* 3. Registered Events (FIX 1: Strictly visible only when logged-in as regular USER role) */}
            {isAuthenticated && role === "user" && (
              <button
                onClick={(e) => handleProtectedClick(e, "/saved?filter=registered")}
                className={`text-[15px] transition-all cursor-pointer ${
                  isRegisteredActive
                    ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                    : "text-text-primary hover:text-accent font-medium"
                }`}
              >
                Registered Events
              </button>
            )}

            {/* Role-Specific Items (Organizer) */}
            {isAuthenticated && role === "organizer" && (
              <div className="flex items-center pl-3 border-l border-border-default">
                <Link
                  href="/dashboard/organizer"
                  className={`flex items-center gap-1.5 text-[15px] transition-all ${
                    pathname.startsWith("/dashboard/organizer")
                      ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                      : "text-text-primary hover:text-accent font-medium"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  <span>Organizer Hub</span>
                </Link>
              </div>
            )}

            {/* Role-Specific Items (Admin) */}
            {isAuthenticated && role === "admin" && (
              <div className="flex items-center gap-4 pl-3 border-l border-border-default">
                <Link
                  href="/dashboard/admin"
                  className={`text-[15px] transition-all ${
                    pathname === "/dashboard/admin"
                      ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                      : "text-text-primary hover:text-accent font-medium"
                  }`}
                >
                  Manage Events
                </Link>
                <Link
                  href="/dashboard/admin/categories"
                  className={`flex items-center gap-1.5 text-[15px] transition-all ${
                    pathname === "/dashboard/admin/categories"
                      ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                      : "text-text-primary hover:text-accent font-medium"
                  }`}
                >
                  <Tags className="w-4 h-4" aria-hidden="true" />
                  <span>Categories</span>
                </Link>
                <Link
                  href="/dashboard/admin/users"
                  className={`flex items-center gap-1.5 text-[15px] transition-all ${
                    pathname === "/dashboard/admin/users"
                      ? "text-accent font-bold border-b-2 border-accent pb-0.5"
                      : "text-text-primary hover:text-accent font-medium"
                  }`}
                >
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>Users</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface-secondary transition-colors cursor-pointer shrink-0"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-warning" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
            )}
          </button>

          {/* FIX 2: Profile Avatar (when logged in) OR "Join Now" CTA Button (when logged out) */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="User profile"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:ring-2 hover:ring-accent/30 transition-all shrink-0"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name || "User profile"}
                  className="w-8 h-8 rounded-full object-cover border border-border-default shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center select-none shadow-2xs border border-accent/40">
                  {getInitials(user?.name)}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-full shadow-sm hover:shadow-md hover:shadow-accent/25 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer whitespace-nowrap"
            >
              Join Now
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-text-primary hover:bg-bg-surface-secondary transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-bg-surface px-4 py-4 space-y-2 shadow-lg transition-all animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={(e) => handleProtectedClick(e, "/events")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isAllEventsActive
                ? "bg-accent/15 text-accent"
                : "text-text-primary hover:bg-bg-surface-secondary"
            }`}
          >
            All Events
          </button>

          <button
            onClick={(e) => handleProtectedClick(e, "/saved")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isSavedActive
                ? "bg-accent/15 text-accent"
                : "text-text-primary hover:bg-bg-surface-secondary"
            }`}
          >
            Saved Events
          </button>

          {/* FIX 1: Only render Registered Events in mobile drawer for regular USER role */}
          {isAuthenticated && role === "user" && (
            <button
              onClick={(e) => handleProtectedClick(e, "/saved?filter=registered")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                isRegisteredActive
                  ? "bg-accent/15 text-accent"
                  : "text-text-primary hover:bg-bg-surface-secondary"
              }`}
            >
              Registered Events
            </button>
          )}

          {/* Role-Specific Mobile Links */}
          {isAuthenticated && role === "organizer" && (
            <div className="pt-2 border-t border-border-default">
              <Link
                href="/dashboard/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-surface-secondary"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span>Organizer Hub</span>
              </Link>
            </div>
          )}

          {isAuthenticated && role === "admin" && (
            <div className="pt-2 border-t border-border-default space-y-1">
              <Link
                href="/dashboard/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-surface-secondary"
              >
                Manage Events
              </Link>
              <Link
                href="/dashboard/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-surface-secondary"
              >
                <Tags className="w-4 h-4 text-accent" />
                <span>Categories</span>
              </Link>
              <Link
                href="/dashboard/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-surface-secondary"
              >
                <Users className="w-4 h-4 text-accent" />
                <span>Users</span>
              </Link>
            </div>
          )}

          {/* Guest Account Links */}
          {!isAuthenticated && (
            <div className="pt-2 border-t border-border-default flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-text-primary hover:bg-bg-surface-secondary rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm transition-colors"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
