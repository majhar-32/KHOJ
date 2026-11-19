import { AuthUser } from "./authApi";
import { apiRequest } from "./api";

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
  return apiRequest<{ user: AuthUser }>("/auth/me", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
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

  return apiRequest<{ user: AuthUser; profilePictureUrl: string }>("/auth/me/picture", {
    method: "POST",
    token,
    body: formData,
  });
}

/**
 * Change account password verifying current password
 */
export async function changePassword(
  data: ChangePasswordData,
  token: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

/**
 * Toggle registered status for an event (auto-saves if not saved yet)
 */
export async function toggleRegisterEvent(
  eventId: string,
  token: string
): Promise<RegisterEventResponse> {
  return apiRequest<RegisterEventResponse>(`/events/${eventId}/register`, {
    method: "POST",
    token,
  });
}

/**
 * Fetch profile stats (role-specific: saved & registered counts for USER, event breakdown for ORGANIZER)
 */
export async function getProfileStats(token: string): Promise<ProfileStats> {
  return apiRequest<ProfileStats>("/auth/me/stats", {
    token,
  });
}
