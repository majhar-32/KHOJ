"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategoriesWithCounts,
  addCategory,
  renameCategory,
  deleteCategory,
  CategoryWithCount,
} from "@/lib/categoriesApi";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CategoryManagerClient({ initialCategories = [] }: { initialCategories?: CategoryWithCount[] }) {
  const { token, isLoading: authLoading } = useAuth();
  const [cats, setCats] = useState<CategoryWithCount[]>(initialCategories);
  const [loading, setLoading] = useState(!initialCategories.length);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const updated = await getCategoriesWithCounts(token);
      setCats(updated);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refresh();
    } else if (!authLoading && !token) {
      setLoading(false);
    }
  }, [token, authLoading, refresh]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (cats.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("A category with that name already exists.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await addCategory(trimmed, token);
      setNewName("");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setError(null);
  };

  const handleRename = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await renameCategory(id, trimmed, token);
      setEditingId(null);
      setEditingName("");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to rename category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const result = await deleteCategory(id, token);
      if (!result.success) {
        setError(result.reason ?? "Cannot delete this category.");
        setTimeout(() => setError(null), 4000);
      } else {
        await refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Category Management</h1>
        <p className="text-text-secondary">Add, rename, or remove event categories.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Add new category */}
      <Card className="p-6 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-3">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            id="new-category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Science Olympiad"
            className="flex-1"
          />
          <Button type="submit" disabled={!newName.trim() || isSubmitting}>
            <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </form>
      </Card>

      {/* Category list */}
      <Card padded={false} className="overflow-hidden">
        <div className="bg-bg-surface-secondary border-b border-border-default px-6 py-3">
          <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
            {cats.length} categor{cats.length !== 1 ? "ies" : "y"}
          </span>
        </div>
        <ul className="divide-y divide-border-default">
          {loading ? (
            <li className="px-6 py-8 text-center text-sm text-text-muted">Loading categories...</li>
          ) : cats.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-text-muted">No categories found.</li>
          ) : (
            cats.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-6 py-3">
                {editingId === cat.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      aria-label="Rename category"
                      className="flex-1 h-9 rounded-lg border border-accent bg-bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(cat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      onClick={() => handleRename(cat.id)}
                      aria-label="Save rename"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-success hover:bg-success/15"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel rename"
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-bg-surface-secondary"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-text-primary text-sm">{cat.name}</span>
                    <span className="text-xs text-text-muted mr-2">{cat.count} event{cat.count !== 1 ? "s" : ""}</span>
                    <button
                      onClick={() => startEdit(cat)}
                      aria-label={`Rename ${cat.name}`}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-bg-surface-secondary"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    {cat.count > 0 ? (
                      <span title="Cannot delete — this category is used by one or more events">
                        <button
                          disabled
                          aria-label={`Cannot delete ${cat.name} — in use by ${cat.count} event(s)`}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted/40 cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        aria-label={`Delete ${cat.name}`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-danger hover:bg-danger/15"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
