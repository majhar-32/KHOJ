import { KhojEvent } from "./types";
import { mockEvents } from "./mockData";

/**
 * MOCK API LAYER
 * ----------------------------------------------------------------
 * There is no real backend yet. Every function here simulates what
 * a real API call will look like once the backend exists, so that
 * swapping this file for real `fetch("/api/...")` calls later is a
 * small, contained change rather than a rewrite of every screen.
 *
 * Data lives in-memory for the lifetime of the browser session only.
 * Nothing here is persisted.
 */

// In-memory working copy so mutations (save, submit, approve...) don't
// permanently modify the original seed data on hot-reload.
const events: KhojEvent[] = mockEvents.map((e) => ({ ...e }));

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getEvents(): Promise<KhojEvent[]> {
  return delay(events.filter((e) => e.status === "approved"));
}

export async function getAllEventsForAdmin(): Promise<KhojEvent[]> {
  return delay(events);
}

export async function getEventsByOrganizer(organizerName: string): Promise<KhojEvent[]> {
  return delay(events.filter((e) => e.organizerName === organizerName));
}

export async function getEventById(id: string): Promise<KhojEvent | undefined> {
  return delay(events.find((e) => e.id === id));
}

export async function getSavedEvents(): Promise<KhojEvent[]> {
  return delay(events.filter((e) => e.saved));
}

export async function toggleSaveEvent(id: string): Promise<KhojEvent | undefined> {
  const event = events.find((e) => e.id === id);
  if (event) event.saved = !event.saved;
  return delay(event);
}

export async function getCategories(): Promise<string[]> {
  const unique = Array.from(new Set(events.map((e) => e.category)));
  return delay(unique.sort());
}

export async function approveEvent(id: string): Promise<KhojEvent | undefined> {
  const event = events.find((e) => e.id === id);
  if (event) {
    event.status = "approved";
    event.rejectionReason = undefined;
  }
  return delay(event);
}

export async function rejectEvent(id: string, reason: string): Promise<KhojEvent | undefined> {
  const event = events.find((e) => e.id === id);
  if (event) {
    event.status = "rejected";
    event.rejectionReason = reason;
  }
  return delay(event);
}

export async function createEvent(eventData: Omit<KhojEvent, "id" | "status" | "saved">): Promise<KhojEvent> {
  const newEvent: KhojEvent = {
    ...eventData,
    id: `ev_${Date.now()}`,
    status: "pending",
    saved: false,
  };
  events.push(newEvent);
  return delay(newEvent);
}
