import { KhojEvent } from "./types";
import { apiRequest } from "./api";

export interface EventFilterParams {
  category?: string;
  city?: string;
  mode?: string;
  q?: string;
  [key: string]: unknown;
}

export async function getEvents(params?: EventFilterParams): Promise<KhojEvent[]> {
  return apiRequest<KhojEvent[]>("/events", { params });
}

export async function getAllEventsForAdmin(token?: string | null): Promise<KhojEvent[]> {
  return apiRequest<KhojEvent[]>("/events/admin", { token });
}

export async function getEventsByOrganizer(
  organizerNameOrToken?: string,
  token?: string | null
): Promise<KhojEvent[]> {
  const authToken = token || organizerNameOrToken;
  return apiRequest<KhojEvent[]>("/events/mine", { token: authToken });
}

export async function getEventById(id: string): Promise<KhojEvent | undefined> {
  try {
    return await apiRequest<KhojEvent>(`/events/${id}`);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "statusCode" in err && (err as { statusCode: number }).statusCode === 404) {
      return undefined;
    }
    throw err;
  }
}

export async function createEvent(
  eventData: Omit<KhojEvent, "id" | "status" | "saved">,
  token?: string | null
): Promise<KhojEvent> {
  return apiRequest<KhojEvent>("/events", {
    method: "POST",
    token,
    body: JSON.stringify(eventData),
  });
}

export async function updateEvent(
  id: string,
  eventData: Partial<KhojEvent>,
  token?: string | null
): Promise<KhojEvent | undefined> {
  return apiRequest<KhojEvent>(`/events/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(eventData),
  });
}

export async function approveEvent(
  id: string,
  token?: string | null
): Promise<KhojEvent | undefined> {
  return apiRequest<KhojEvent>(`/events/${id}/approve`, {
    method: "POST",
    token,
  });
}

export async function rejectEvent(
  id: string,
  reason: string,
  token?: string | null
): Promise<KhojEvent | undefined> {
  return apiRequest<KhojEvent>(`/events/${id}/reject`, {
    method: "POST",
    token,
    body: JSON.stringify({ reason }),
  });
}

export async function getSavedEvents(token?: string | null): Promise<KhojEvent[]> {
  return apiRequest<KhojEvent[]>("/events/saved", { token });
}

export async function toggleSaveEvent(
  id: string,
  token?: string | null
): Promise<{ saved: boolean }> {
  return apiRequest<{ saved: boolean }>(`/events/${id}/save`, {
    method: "POST",
    token,
  });
}

export async function getCategories(): Promise<string[]> {
  return apiRequest<string[]>("/categories");
}
