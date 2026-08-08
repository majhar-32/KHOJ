"use client";

import { KhojEvent } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StatusChip, CategoryTag, DeadlineBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit2, Eye } from "lucide-react";

export function OrganizerDashboardClient({ events, organizerName }: { events: KhojEvent[], organizerName: string }) {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Organizer Dashboard</h1>
          <p className="text-neutral-600">Managing events for <span className="font-medium text-neutral-900">{organizerName}</span></p>
        </div>
        <Link href="/dashboard/organizer/submit">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Submit New Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Total Events</p>
          <p className="text-3xl font-bold text-neutral-900">{events.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Approved</p>
          <p className="text-3xl font-bold text-success-600">
            {events.filter(e => e.status === "approved").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-neutral-500 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-warning-600">
            {events.filter(e => e.status === "pending").length}
          </p>
        </Card>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
              <tr>
                <th className="px-6 py-4 font-medium">Event Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    You haven&apos;t submitted any events yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const daysLeft = Math.ceil(
                    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );
                  
                  return (
                    <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{event.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">{new Date(event.eventDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <CategoryTag label={event.category} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={event.status} />
                        {event.status === "rejected" && event.rejectionReason && (
                          <div className="text-xs text-error-600 mt-1 max-w-[200px] truncate" title={event.rejectionReason}>
                            Reason: {event.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <DeadlineBadge daysLeft={daysLeft} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500 hover:text-primary-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {event.status !== "approved" && (
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500 hover:text-primary-600">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
