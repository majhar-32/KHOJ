import { getCategories } from "@/lib/eventsApi";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export const dynamic = 'force-dynamic';

export default async function SubmitEventPage() {
  let categories: string[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Error loading categories:", error);
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SubmitEventForm categories={categories} />
    </div>
  );
}
