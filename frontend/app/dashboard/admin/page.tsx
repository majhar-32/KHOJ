import { getAllEventsForAdmin } from "@/lib/mockApi";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const events = await getAllEventsForAdmin();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <AdminDashboardClient initialEvents={events} />
    </div>
  );
}
