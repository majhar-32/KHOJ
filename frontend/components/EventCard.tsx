import { KhojEvent } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { MapPin, Monitor, Building2, Ticket } from "lucide-react";
import Link from "next/link";

export function EventCard({ event, showStatus = false }: { event: KhojEvent; showStatus?: boolean }) {
  // Calculate days left
  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <Link href={`/events/${event.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl">
      <Card padded={false} className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
        {/* Mock Banner */}
        <div 
          className="h-32 w-full shrink-0 relative p-4 flex flex-col justify-between"
          style={{ backgroundColor: event.bannerColor }}
        >
          <div className="flex justify-between items-start gap-2">
            <CategoryTag label={event.category} />
            {showStatus && <StatusChip status={event.status} />}
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
              <Ticket className="w-4 h-4 shrink-0 text-neutral-400" />
              <span className="truncate">{event.registrationFee}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {event.mode === "online" ? (
                <>
                  <Monitor className="w-4 h-4 shrink-0 text-neutral-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{event.city}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
