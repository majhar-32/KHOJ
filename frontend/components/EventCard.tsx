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
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
      >
        <Card
          padded={false}
          className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all group border-border-default bg-bg-surface"
        >
          {/* Banner Container */}
          <div
            className={`h-32 w-full shrink-0 relative p-4 flex flex-col justify-between overflow-hidden ${
              !event.bannerImageUrl
                ? bannerToneClasses[event.bannerColor] || bannerToneClasses.default
                : "bg-bg-surface-secondary"
            }`}
          >
            {event.bannerImageUrl && (
              <>
                <img
                  src={event.bannerImageUrl}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
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
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-bg-surface/90 hover:bg-bg-surface shadow-sm border border-border-default transition-colors"
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      saved
                        ? "fill-accent text-accent"
                        : "text-text-secondary"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="relative z-10 self-start flex items-center gap-1.5 flex-wrap">
              <DeadlineBadge daysLeft={daysLeft} />
              {registered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Registered
                </span>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-text-primary line-clamp-2 text-lg mb-1 group-hover:text-accent transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-1">
              by {event.organizerName}
            </p>

            <div className="mt-auto space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Ticket
                  className="w-4 h-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                />
                <span className="truncate">{event.registrationFee}</span>
              </div>

              <div className="flex items-center gap-2">
                {event.mode === "online" ? (
                  <>
                    <Monitor
                      className="w-4 h-4 shrink-0 text-text-muted"
                      aria-hidden="true"
                    />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin
                      className="w-4 h-4 shrink-0 text-text-muted"
                      aria-hidden="true"
                    />
                    <span className="truncate">{event.city}</span>
                  </>
                )}
              </div>
            </div>

            {showRegisterToggle && (
              <div className="mt-4 pt-3 border-t border-border-default">
                <button
                  type="button"
                  onClick={handleToggleRegister}
                  disabled={isRegistering}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    registered
                      ? "bg-success/15 text-success border border-success/30 hover:bg-success/20"
                      : "bg-bg-surface-secondary text-text-primary hover:bg-border-default border border-border-default"
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      registered
                        ? "text-success"
                        : "text-text-muted"
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
