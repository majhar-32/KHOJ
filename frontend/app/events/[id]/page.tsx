import { getEventById } from "@/lib/eventsApi";
import { notFound } from "next/navigation";
import { EventDetailsClient } from "@/components/EventDetailsClient";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  try {
    event = await getEventById(id);
  } catch (error) {
    console.error("Error fetching event:", error);
  }

  if (!event) notFound();
  return <EventDetailsClient event={event} />;
}
