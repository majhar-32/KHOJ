import { getEventsByOrganizer } from "@/lib/mockApi";
import { OrganizerDashboardClient } from "@/components/OrganizerDashboardClient";

export const dynamic = 'force-dynamic';

export default async function OrganizerDashboardPage() {
  const mockOrganizerName = "BUET Computer Club";
  const events = await getEventsByOrganizer(mockOrganizerName);

  return (
    <div className="min-h-screen bg-neutral-50">
      <OrganizerDashboardClient events={events} organizerName={mockOrganizerName} />
    </div>
  );
}
