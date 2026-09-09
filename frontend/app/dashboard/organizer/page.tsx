import { OrganizerDashboardClient } from "@/components/OrganizerDashboardClient";

export const dynamic = 'force-dynamic';

export default function OrganizerDashboardPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <OrganizerDashboardClient />
    </div>
  );
}
