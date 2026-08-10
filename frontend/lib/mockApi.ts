import { KhojEvent, KhojUser, KhojCategory } from "./types";
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

// ----------------------------------------------------------------
// Category Store (seeded from event data; can be mutated independently)
// ----------------------------------------------------------------
const categories: KhojCategory[] = Array.from(
  new Set(mockEvents.map((e) => e.category))
)
  .sort()
  .map((name, i) => ({ id: `cat-${i + 1}`, name }));

// ----------------------------------------------------------------
// User Store
// ----------------------------------------------------------------
const users: KhojUser[] = [
  { id: "usr-001", name: "Rahim Uddin", email: "rahim@example.com", role: "user", verified: true, status: "active", joinedDate: "2025-01-10" },
  { id: "usr-002", name: "Sadia Islam", email: "sadia@example.com", role: "organizer", verified: true, status: "active", joinedDate: "2025-02-14" },
  { id: "usr-003", name: "Tanvir Ahmed", email: "tanvir@example.com", role: "user", verified: false, status: "active", joinedDate: "2025-03-05" },
  { id: "usr-004", name: "Nusrat Jahan", email: "nusrat@example.com", role: "organizer", verified: true, status: "active", joinedDate: "2025-03-22" },
  { id: "usr-005", name: "Arif Hossain", email: "arif@example.com", role: "user", verified: true, status: "suspended", joinedDate: "2025-04-01" },
  { id: "usr-006", name: "Fahmida Akter", email: "fahmida@example.com", role: "user", verified: false, status: "active", joinedDate: "2025-04-18" },
  { id: "usr-007", name: "Mehedi Hassan", email: "mehedi@example.com", role: "organizer", verified: true, status: "active", joinedDate: "2025-05-09" },
  { id: "usr-008", name: "Sumaiya Begum", email: "sumaiya@example.com", role: "user", verified: true, status: "active", joinedDate: "2025-05-30" },
  { id: "usr-009", name: "Khaled Mahmud", email: "khaled@example.com", role: "organizer", verified: false, status: "suspended", joinedDate: "2025-06-12" },
  { id: "usr-010", name: "Riya Chakraborty", email: "riya@example.com", role: "user", verified: true, status: "active", joinedDate: "2025-07-04" },
  { id: "usr-011", name: "Imran Karim", email: "imran@example.com", role: "user", verified: false, status: "active", joinedDate: "2025-07-19" },
  { id: "usr-012", name: "Tasnim Rahman", email: "tasnim@example.com", role: "organizer", verified: true, status: "active", joinedDate: "2025-08-01" },
];

// ----------------------------------------------------------------
// Events API
// ----------------------------------------------------------------

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

export async function updateEvent(id: string, eventData: Partial<Omit<KhojEvent, "id">>): Promise<KhojEvent | undefined> {
  const event = events.find((e) => e.id === id);
  if (event) {
    Object.assign(event, eventData);
    // Editing a live event requires re-approval
    if (event.status === "approved") {
      event.status = "pending";
    }
  }
  return delay(event);
}

// ----------------------------------------------------------------
// Category API
// ----------------------------------------------------------------

/** Returns categories from the seeded/managed category store */
export async function getCategories(): Promise<string[]> {
  return delay(categories.map((c) => c.name).sort());
}

export async function getCategoriesWithCounts(): Promise<Array<{ id: string; name: string; count: number }>> {
  return delay(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: events.filter((e) => e.category === cat.name).length,
    }))
  );
}

export async function addCategory(name: string): Promise<KhojCategory> {
  const newCat: KhojCategory = { id: `cat_${Date.now()}`, name: name.trim() };
  categories.push(newCat);
  return delay(newCat);
}

export async function renameCategory(id: string, newName: string): Promise<KhojCategory | undefined> {
  const cat = categories.find((c) => c.id === id);
  if (cat) {
    const old = cat.name;
    cat.name = newName.trim();
    // Update existing events using the old name
    events.forEach((e) => { if (e.category === old) e.category = cat.name; });
  }
  return delay(cat);
}

export async function deleteCategory(id: string): Promise<{ success: boolean; reason?: string }> {
  const cat = categories.find((c) => c.id === id);
  if (!cat) return delay({ success: false, reason: "Not found" });
  const inUse = events.some((e) => e.category === cat.name);
  if (inUse) return delay({ success: false, reason: "Category is in use by one or more events" });
  const idx = categories.findIndex((c) => c.id === id);
  categories.splice(idx, 1);
  return delay({ success: true });
}

// ----------------------------------------------------------------
// User API
// ----------------------------------------------------------------

export async function getUsers(): Promise<KhojUser[]> {
  return delay([...users]);
}

export async function suspendUser(id: string): Promise<KhojUser | undefined> {
  const user = users.find((u) => u.id === id);
  if (user) user.status = "suspended";
  return delay(user);
}

export async function reactivateUser(id: string): Promise<KhojUser | undefined> {
  const user = users.find((u) => u.id === id);
  if (user) user.status = "active";
  return delay(user);
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
  const cats = await getCategories();
  for (const cat of cats) {
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
  const cats = await getCategories();
  for (const cat of cats) {
    if (lowerQuery.includes(cat.toLowerCase())) {
      result.category = cat;
      break;
    }
  }

  // City — derived dynamically from event data so it always matches exactly
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
