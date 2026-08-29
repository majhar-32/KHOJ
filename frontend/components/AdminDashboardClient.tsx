"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KhojEvent } from "@/lib/types";
import { approveEvent, rejectEvent, getAllEventsForAdmin } from "@/lib/eventsApi";
import { Card } from "@/components/ui/Card";
import { StatusChip, CategoryTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { Check, X, Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function AdminDashboardClient({ initialEvents = [] }: { initialEvents?: KhojEvent[] }) {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<KhojEvent[]>(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [error, setError] = useState<string | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<KhojEvent | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAllEventsForAdmin(token);
      setEvents(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch admin events");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEvents();
    } else if (!authLoading && !token) {
      setLoading(false);
    }
  }, [token, authLoading, fetchEvents]);

  // Group events
  const pending = events.filter(e => e.status === "pending");
  const approved = events.filter(e => e.status === "approved");
  const rejected = events.filter(e => e.status === "rejected");

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const updated = await approveEvent(id, token);
      if (updated) {
        setEvents(prev => prev.map(e => e.id === id ? updated : e));
        router.refresh();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingEvent || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      const updated = await rejectEvent(rejectingEvent.id, rejectionReason, token);
      if (updated) {
        setEvents(prev => prev.map(e => e.id === rejectingEvent.id ? updated : e));
        router.refresh();
      }
      setRejectingEvent(null);
      setRejectionReason("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reject event");
    } finally {
      setIsProcessing(false);
    }
  };

  const EventRow = ({ event }: { event: KhojEvent }) => (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-neutral-900">{event.name}</div>
        <div className="text-xs text-neutral-500 mt-1">by {event.organizerName}</div>
      </td>
      <td className="px-6 py-4">
        <CategoryTag label={event.category} />
      </td>
      <td className="px-6 py-4">
        <StatusChip status={event.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Link href={`/events/${event.id}`}>
            <Button variant="ghost" size="sm" aria-label={`View ${event.name}`} className="h-8 px-2 text-neutral-500 hover:text-primary-600">
              <Eye className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
          {event.status === "pending" && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                aria-label={`Approve ${event.name}`}
                className="h-8 px-2 text-success-600 hover:bg-success-50 hover:text-success-700"
                onClick={() => handleApprove(event.id)}
                disabled={isProcessing}
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                aria-label={`Reject ${event.name}`}
                className="h-8 px-2 text-error-600 hover:bg-error-50 hover:text-error-700"
                onClick={() => setRejectingEvent(event)}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">Review and manage platform events.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-warning-600">{pending.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Approved Events</p>
          <p className="text-3xl font-bold text-success-600">{approved.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Rejected Events</p>
          <p className="text-3xl font-bold text-error-600">{rejected.length}</p>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Pending Events Table */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
            Pending Review
            <span className="ml-2 bg-warning-100 text-warning-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </h2>
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
                  <tr>
                    <th className="px-6 py-4 font-medium">Event & Organizer</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-500">
                        Loading pending events...
                      </td>
                    </tr>
                  ) : pending.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-lg font-medium text-neutral-900 mb-1">All caught up!</p>
                        <p className="text-sm text-neutral-500">No events are awaiting review right now.</p>
                      </td>
                    </tr>
                  ) : (
                    pending.map(event => <EventRow key={event.id} event={event} />)
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Actioned Events Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Recently Approved</h2>
            <Card padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600">
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {loading ? (
                      <tr><td className="px-6 py-8 text-center text-sm text-neutral-400">Loading approved events...</td></tr>
                    ) : approved.length === 0 ? (
                      <tr><td className="px-6 py-8 text-center text-sm text-neutral-400">No approved events yet.</td></tr>
                    ) : (
                      approved.slice(0, 5).map(event => <EventRow key={event.id} event={event} />)
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Recently Rejected</h2>
            <Card padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-600">
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {loading ? (
                      <tr><td className="px-6 py-8 text-center text-sm text-neutral-400">Loading rejected events...</td></tr>
                    ) : rejected.length === 0 ? (
                      <tr><td className="px-6 py-8 text-center text-sm text-neutral-400">No rejected events.</td></tr>
                    ) : (
                      rejected.slice(0, 5).map(event => <EventRow key={event.id} event={event} />)
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        open={!!rejectingEvent}
        onClose={() => {
          setRejectingEvent(null);
          setRejectionReason("");
        }}
        title="Reject Event"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Please provide a reason for rejecting <strong>{rejectingEvent?.name}</strong>. The organizer will see this feedback.
          </p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. The registration link is invalid..."
            required
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setRejectingEvent(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || isProcessing}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
