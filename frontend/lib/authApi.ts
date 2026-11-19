import { apiRequest } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
  verified: boolean;
  status: "ACTIVE" | "SUSPENDED";
  dateOfBirth?: string | null;
  institution?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ORGANIZER";
}

export interface LoginData {
  email: string;
  password: string;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>("/auth/me", {
    token,
  });
}
