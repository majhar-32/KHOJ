"use client";

import { useState } from "react";
import { KhojEvent } from "@/lib/types";
import { toggleSaveEvent } from "@/lib/mockApi";
import { Card } from "@/components/ui/Card";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { MapPin, Monitor, Ticket, Bookmark } from "lucide-react";
import Link from "next/link";

const bannerToneClasses: Record<string, string> = {
  primary: "bg-primary-50",
  success: "bg-success-50",
  warning: "bg-warning-50",
  error: "bg-error-50",
  default: "bg-neutral-100",
};

export function EventCard({ event, showStatus = false }: { event: KhojEvent; showStatus?: boolean }) {
  const [saved, setSaved] = useState(!!event.saved);
  const [toast, setToast] = useState<string | null>(null);

  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await toggleSaveEvent(event.id);
    if (updated !== undefined) {
      setSaved(!!updated.saved);
      setToast(updated.saved ? "Saved!" : "Removed from saved");
    }
  };

  return (
    <>
      <Link href={`/events/${event.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl">
        <Card padded={false} className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
          {/* Mock Banner */}
          <div
            className={`h-32 w-full shrink-0 relative p-4 flex flex-col justify-between ${bannerToneClasses[event.bannerColor] || bannerToneClasses.default}`}
          >
            <div className="flex justify-between items-start gap-2">
              <CategoryTag label={event.category} />
              <div className="flex items-center gap-1">
                {showStatus && <StatusChip status={event.status} />}
                <button
                  onClick={handleSave}
                  aria-label={saved ? `Remove ${event.name} from saved` : `Save ${event.name}`}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                >
                  <Bookmark
                    className={`w-4 h-4 transition-colors ${saved ? "fill-primary-600 text-primary-600" : "text-neutral-500"}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 self-start shadow-sm">
              <DeadlineBadge daysLeft={daysLeft} />
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-semibold text-neutral-900 line-clamp-2 text-lg mb-1 group-hover:text-primary-700 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-500 mb-4 line-clamp-1">
              by {event.organizerName}
            </p>

            <div className="mt-auto space-y-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 shrink-0 text-neutral-400" aria-hidden="true" />
                <span className="truncate">{event.registrationFee}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {event.mode === "online" ? (
                  <>
                    <Monitor className="w-4 h-4 shrink-0 text-neutral-400" aria-hidden="true" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 shrink-0 text-neutral-400" aria-hidden="true" />
                    <span className="truncate">{event.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
