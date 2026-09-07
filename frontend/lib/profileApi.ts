import { AuthUser } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface UpdateProfileData {
  name?: string;
  dateOfBirth?: string | null;
  institution?: string | null;
  address?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserStats {
  role: "USER" | "ADMIN";
  savedEventsCount: number;
  registeredEventsCount: number;
}

export interface OrganizerStats {
  role: "ORGANIZER";
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  rejectedEvents: number;
}

export type ProfileStats = UserStats | OrganizerStats;

export interface RegisterEventResponse {
  saved: boolean;
  registered: boolean;
  message: string;
}

/**
 * Update user's personal profile fields (name, dateOfBirth, institution, address)
 */
export async function updateProfile(
  data: UpdateProfileData,
  token: string
): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to update profile");
  }

  return result;
}

/**
 * Upload profile picture using multipart/form-data with field name "picture"
 */
export async function uploadProfilePicture(
  fileOrFormData: File | FormData,
  token: string
): Promise<{ user: AuthUser; profilePictureUrl: string }> {
  let formData: FormData;
  if (fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    formData.append("picture", fileOrFormData);
  }

  const res = await fetch(`${API_BASE_URL}/auth/me/picture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to upload profile picture");
  }

  return result;
}

/**
 * Change account password verifying current password
 */
export async function changePassword(
  data: ChangePasswordData,
  token: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to change password");
  }

  return result;
}

/**
 * Toggle registered status for an event (auto-saves if not saved yet)
 */
export async function toggleRegisterEvent(
  eventId: string,
  token: string
): Promise<RegisterEventResponse> {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to update event registration");
  }

  return result;
}

/**
 * Fetch profile stats (role-specific: saved & registered counts for USER, event breakdown for ORGANIZER)
 */
export async function getProfileStats(token: string): Promise<ProfileStats> {
  const res = await fetch(`${API_BASE_URL}/auth/me/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to fetch profile statistics");
  }

  return result;
}
