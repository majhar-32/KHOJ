import { OrganizerDashboardClient } from "@/components/OrganizerDashboardClient";

export const dynamic = 'force-dynamic';

export default function OrganizerDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <OrganizerDashboardClient />
    </div>
  );
}
