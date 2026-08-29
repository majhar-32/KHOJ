import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <AdminDashboardClient />
    </div>
  );
}
