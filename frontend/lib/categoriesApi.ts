import { apiRequest, ApiError } from "./api";

export interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

export async function getCategories(): Promise<string[]> {
  return apiRequest<string[]>("/categories");
}

export async function getCategoriesWithCounts(
  token?: string | null
): Promise<CategoryWithCount[]> {
  return apiRequest<CategoryWithCount[]>("/categories/counts", { token });
}

export async function addCategory(
  name: string,
  token?: string | null
): Promise<{ id: string; name: string }> {
  return apiRequest<{ id: string; name: string }>("/categories", {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });
}

export async function renameCategory(
  id: string,
  newName: string,
  token?: string | null
): Promise<{ id: string; name: string }> {
  return apiRequest<{ id: string; name: string }>(`/categories/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ name: newName }),
  });
}

export async function deleteCategory(
  id: string,
  token?: string | null
): Promise<{ success: boolean; reason?: string }> {
  try {
    await apiRequest<{ success: boolean }>(`/categories/${id}`, {
      method: "DELETE",
      token,
    });
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.statusCode === 409) {
      return { success: false, reason: err.message };
    }
    throw err;
  }
}
