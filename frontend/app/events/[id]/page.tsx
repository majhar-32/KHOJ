import { getEventById } from "@/lib/mockApi";
import { notFound } from "next/navigation";
import { EventDetailsClient } from "@/components/EventDetailsClient";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  return <EventDetailsClient event={event} />;
}
