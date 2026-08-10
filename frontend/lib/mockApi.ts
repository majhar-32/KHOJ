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

// ----------------------------------------------------------------
// AI Simulation Helpers
// ----------------------------------------------------------------

export async function simulateAIExtraction(rawText: string): Promise<Partial<KhojEvent>> {
  // Simulate network delay (1.5 - 2.5s)
  await delay(null, Math.random() * 1000 + 1500);

  // Simulate 15% failure rate
  if (Math.random() < 0.15) {
    throw new Error("AI could not extract structured data from this text.");
  }

  const result: Partial<KhojEvent> = {};
  const lowerText = rawText.toLowerCase();

  // Basic category matching
  const categories = await getCategories();
  for (const cat of categories) {
    if (lowerText.includes(cat.toLowerCase())) {
      result.category = cat;
      break;
    }
  }

  // Basic fee extraction
  if (lowerText.includes("free") || lowerText.includes("no fee")) {
    result.registrationFee = "Free";
  } else {
    const feeMatch = rawText.match(/(?:৳|Tk\.?|BDT)\s*(\d+)/i);
    if (feeMatch) {
      result.registrationFee = `৳${feeMatch[1]}`;
    }
  }

  // Basic team size
  if (lowerText.includes("individual") || lowerText.includes("solo")) {
    result.teamSize = "1";
  } else {
    const teamMatch = lowerText.match(/(?:team of|team size)\s*(\d+(?:-\d+)?)/i) || lowerText.match(/(\d+(?:-\d+)?)\s*members/i);
    if (teamMatch) {
      result.teamSize = teamMatch[1];
    }
  }

  // Basic deadline extraction (mocked offset)
  if (lowerText.includes("deadline") || lowerText.includes("last date") || lowerText.includes("register by")) {
    // Just mock it to 7 days from now for simulation
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    result.registrationDeadline = nextWeek.toISOString().split("T")[0];
  }

  return result;
}

export async function simulateAISearch(query: string): Promise<{ category?: string; city?: string; mode?: "online" | "offline"; deadlineBefore?: string }> {
  await delay(null, Math.random() * 1000 + 1000);
  
  const result: { category?: string; city?: string; mode?: "online" | "offline"; deadlineBefore?: string } = {};
  const lowerQuery = query.toLowerCase();

  // Category
  const categories = await getCategories();
  for (const cat of categories) {
    if (lowerQuery.includes(cat.toLowerCase())) {
      result.category = cat;
      break;
    }
  }

  // City (Hardcoded a few common ones for simulation)
  // Derive city list dynamically from event data so it always matches exactly
  const cities = Array.from(new Set(events.map((e) => e.city).filter(Boolean)));
  for (const city of cities) {
    if (lowerQuery.includes(city.toLowerCase())) {
      result.city = city;
      break;
    }
  }

  // Mode
  if (lowerQuery.includes("online") || lowerQuery.includes("virtual")) {
    result.mode = "online";
  } else if (lowerQuery.includes("offline") || lowerQuery.includes("in person")) {
    result.mode = "offline";
  }

  // Relative deadline
  if (lowerQuery.includes("this week")) {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    result.deadlineBefore = endOfWeek.toISOString().split("T")[0];
  } else if (lowerQuery.includes("next month")) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    result.deadlineBefore = nextMonth.toISOString().split("T")[0];
  }

  return result;
}
