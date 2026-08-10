"use client";

import { useState } from "react";
import { getCategoriesWithCounts, addCategory, renameCategory, deleteCategory } from "@/lib/mockApi";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

type CatRow = { id: string; name: string; count: number };

export function CategoryManagerClient({ initialCategories }: { initialCategories: CatRow[] }) {
  const [cats, setCats] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const updated = await getCategoriesWithCounts();
    setCats(updated);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (cats.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("A category with that name already exists.");
      return;
    }
    await addCategory(trimmed);
    setNewName("");
    setError(null);
    await refresh();
  };

  const startEdit = (cat: CatRow) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleRename = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    await renameCategory(id, trimmed);
    setEditingId(null);
    setEditingName("");
    await refresh();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (!result.success) {
      setError(result.reason ?? "Cannot delete this category.");
      setTimeout(() => setError(null), 3000);
    } else {
      await refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Category Management</h1>
        <p className="text-neutral-600">Add, rename, or remove event categories.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {/* Add new category */}
      <Card className="p-6 mb-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-3">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            id="new-category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Science Olympiad"
            className="flex-1"
          />
          <Button type="submit" disabled={!newName.trim()}>
            <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
            Add
          </Button>
        </form>
      </Card>

      {/* Category list */}
      <Card padded={false} className="overflow-hidden">
        <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-3">
          <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            {cats.length} categor{cats.length !== 1 ? "ies" : "y"}
          </span>
        </div>
        <ul className="divide-y divide-neutral-100">
          {cats.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 px-6 py-3">
              {editingId === cat.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    aria-label="Rename category"
                    className="flex-1 h-9 rounded-lg border border-primary-400 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(cat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button onClick={() => handleRename(cat.id)} aria-label="Save rename" className="h-8 w-8 flex items-center justify-center rounded-lg text-success-600 hover:bg-success-50">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button onClick={() => setEditingId(null)} aria-label="Cancel rename" className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-neutral-900 text-sm">{cat.name}</span>
                  <span className="text-xs text-neutral-500 mr-2">{cat.count} event{cat.count !== 1 ? "s" : ""}</span>
                  <button onClick={() => startEdit(cat)} aria-label={`Rename ${cat.name}`} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                  </button>
                  {cat.count > 0 ? (
                    <span title="Cannot delete — this category is used by one or more events">
                      <button
                        disabled
                        aria-label={`Cannot delete ${cat.name} — in use by ${cat.count} event(s)`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-300 cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <button onClick={() => handleDelete(cat.id)} aria-label={`Delete ${cat.name}`} className="h-8 w-8 flex items-center justify-center rounded-lg text-error-500 hover:bg-error-50">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
