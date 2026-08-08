import { getCategories } from "@/lib/mockApi";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export const dynamic = 'force-dynamic';

export default async function SubmitEventPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SubmitEventForm categories={categories} />
    </div>
  );
}
