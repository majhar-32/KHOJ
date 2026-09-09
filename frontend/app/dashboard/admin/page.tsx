import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary pb-20">
      <AdminDashboardClient />
    </div>
  );
}
