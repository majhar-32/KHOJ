import { KhojUser } from "./types";
import { apiRequest } from "./api";

export async function getUsers(token?: string | null): Promise<KhojUser[]> {
  return apiRequest<KhojUser[]>("/users", { token });
}

export async function suspendUser(
  id: string,
  token?: string | null
): Promise<KhojUser> {
  return apiRequest<KhojUser>(`/users/${id}/suspend`, {
    method: "POST",
    token,
  });
}

export async function reactivateUser(
  id: string,
  token?: string | null
): Promise<KhojUser> {
  return apiRequest<KhojUser>(`/users/${id}/reactivate`, {
    method: "POST",
    token,
  });
}

export async function promoteUser(
  id: string,
  token?: string | null
): Promise<KhojUser> {
  return apiRequest<KhojUser>(`/users/${id}/promote`, {
    method: "POST",
    token,
  });
}

export async function demoteUser(
  id: string,
  token?: string | null
): Promise<KhojUser> {
  return apiRequest<KhojUser>(`/users/${id}/demote`, {
    method: "POST",
    token,
  });
}

