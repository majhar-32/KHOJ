const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to sign up");
  }

  return result;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to log in");
  }

  return result;
}

export async function getMe(token: string): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Unauthorized");
  }

  return result;
}
