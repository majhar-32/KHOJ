"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { toggleSaveEvent } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { MapPin, Monitor, Ticket, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toggleRegisterEvent } from "@/lib/profileApi";

const bannerToneClasses: Record<string, string> = {
  primary: "bg-primary-50",
  success: "bg-success-50",
  warning: "bg-warning-50",
  error: "bg-error-50",
  default: "bg-neutral-100",
};

interface EventCardProps {
  event: KhojEvent;
  showStatus?: boolean;
  isSaved?: boolean;
  onToggleSave?: (eventId: string, saved: boolean) => void;
  showRegisterToggle?: boolean;
  onToggleRegister?: (eventId: string, registered: boolean) => void;
}

export function EventCard({
  event,
  showStatus = false,
  isSaved,
  onToggleSave,
  showRegisterToggle = false,
  onToggleRegister,
}: EventCardProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(isSaved ?? !!event.saved);
  const [registered, setRegistered] = useState(!!event.registered);
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isSaved !== undefined) {
      setSaved(isSaved);
    }
  }, [isSaved]);

  useEffect(() => {
    if (event.registered !== undefined) {
      setRegistered(event.registered);
    }
  }, [event.registered]);

  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    const nextSaved = !saved;
    setSaved(nextSaved);
    setToast(nextSaved ? "Saved!" : "Removed from saved");

    try {
      const res = await toggleSaveEvent(event.id, token);
      if (res.saved !== nextSaved) {
        setSaved(res.saved);
      }
      onToggleSave?.(event.id, res.saved);
    } catch {
      setSaved(!nextSaved);
      setToast("Failed to update bookmark");
    }
  };

  const handleToggleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    setIsRegistering(true);
    const nextRegistered = !registered;
    setRegistered(nextRegistered);
    if (!saved && nextRegistered) {
      setSaved(true);
      onToggleSave?.(event.id, true);
    }
    setToast(nextRegistered ? "Marked as registered!" : "Registration unmarked");

    try {
      const res = await toggleRegisterEvent(event.id, token);
      setRegistered(res.registered);
      if (res.saved !== saved) {
        setSaved(res.saved);
        onToggleSave?.(event.id, res.saved);
      }
      onToggleRegister?.(event.id, res.registered);
    } catch {
      setRegistered(!nextRegistered);
      setToast("Failed to update registration status");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <Link
        href={`/events/${event.id}`}
        onClick={handleCardClick}
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
      >
        <Card
          padded={false}
          className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group"
        >
          {/* Banner Container */}
          <div
            className={`h-32 w-full shrink-0 relative p-4 flex flex-col justify-between overflow-hidden ${
              !event.bannerImageUrl
                ? bannerToneClasses[event.bannerColor] || bannerToneClasses.default
                : "bg-neutral-900"
            }`}
          >
            {event.bannerImageUrl && (
              <>
                <img
                  src={event.bannerImageUrl}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-neutral-950/20 to-neutral-950/40" />
              </>
            )}

            <div className="relative z-10 flex justify-between items-start gap-2">
              <CategoryTag label={event.category} />
              <div className="flex items-center gap-1">
                {showStatus && <StatusChip status={event.status} />}
                <button
                  onClick={handleSave}
                  aria-label={
                    saved
                      ? `Remove ${event.name} from saved`
                      : `Save ${event.name}`
                  }
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 shadow-sm transition-colors"
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      saved
                        ? "fill-primary-600 text-primary-600 dark:fill-primary-400 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="relative z-10 self-start flex items-center gap-1.5 flex-wrap">
              <DeadlineBadge daysLeft={daysLeft} />
              {registered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Registered
                </span>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 text-lg mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-1">
              by {event.organizerName}
            </p>

            <div className="mt-auto space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <Ticket
                  className="w-4 h-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                <span className="truncate">{event.registrationFee}</span>
              </div>

              <div className="flex items-center gap-2">
                {event.mode === "online" ? (
                  <>
                    <Monitor
                      className="w-4 h-4 shrink-0 text-neutral-400"
                      aria-hidden="true"
                    />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin
                      className="w-4 h-4 shrink-0 text-neutral-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">{event.city}</span>
                  </>
                )}
              </div>
            </div>

            {showRegisterToggle && (
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleToggleRegister}
                  disabled={isRegistering}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    registered
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      registered
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-400"
                    }`}
                  />
                  {registered ? "Registered (Confirmed)" : "Mark as Registered"}
                </button>
              </div>
            )}
          </div>
        </Card>
      </Link>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
