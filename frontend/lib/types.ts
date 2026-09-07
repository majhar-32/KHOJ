export type Role = "user" | "organizer" | "admin";

export type EventStatus = "pending" | "approved" | "rejected";

export type EventMode = "online" | "offline";

export interface KhojEvent {
  id: string;
  name: string;
  category: string;
  organizerName: string;
  organizerVerified: boolean;
  eventDate: string; // ISO date
  eventTime: string; // e.g. "10:00 AM"
  venue: string;
  city: string;
  mode: EventMode;
  registrationDeadline: string; // ISO date
  registrationFee: string; // e.g. "Free" or "৳500"
  prizePool: string;
  eligibility: string;
  teamSize: string;
  availableSeats: number | null;
  certificateInfo: string;
  description: string;
  rules: string;
  contactInfo: string;
  registrationLink: string;
  officialWebsite: string;
  bannerColor: string; // placeholder banner background (fallback when bannerImageUrl is null)
  bannerImageUrl?: string | null;
  status: EventStatus;
  rejectionReason?: string;
  saved?: boolean;
  registered?: boolean;
}

export type UserRole = "user" | "organizer" | "admin";
export type UserStatus = "active" | "suspended";

export interface KhojUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  status: UserStatus;
  joinedDate: string; // ISO date
  dateOfBirth?: string | null;
  institution?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
}

export interface KhojCategory {
  id: string;
  name: string;
}
