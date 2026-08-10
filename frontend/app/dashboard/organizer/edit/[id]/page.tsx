import { getEventById, getCategories } from "@/lib/mockApi";
import { notFound } from "next/navigation";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, categories] = await Promise.all([getEventById(id), getCategories()]);
  if (!event) notFound();
  return <SubmitEventForm categories={categories} mode="edit" initialData={event} />;
}
