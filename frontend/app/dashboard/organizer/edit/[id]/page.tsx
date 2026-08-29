import { getEventById, getCategories } from "@/lib/eventsApi";
import { notFound } from "next/navigation";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  let categories: string[] = [];
  try {
    [event, categories] = await Promise.all([getEventById(id), getCategories()]);
  } catch (error) {
    console.error("Error loading edit event data:", error);
  }

  if (!event) notFound();
  return <SubmitEventForm categories={categories} mode="edit" initialData={event} />;
}
