"use client";

import { useEffect, useState } from "react";
import { Fish, Plus, Trash2, Edit, Loader2, Save, X, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number | null;
  description: string | null;
}

interface SpeciesItem {
  id: number;
  name: string;
  slug: string;
  sortOrder: number | null;
  categoryId: number | null;
  categoryName: string | null;
  scientificName: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface Suggestion {
  id: number;
  speciesName: string;
  commonNames: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  operatorCompany: string | null;
  operatorEmail: string | null;
}

type Tab = "species" | "categories" | "suggestions";

export default function AdminSpeciesPage() {
  const [tab, setTab] = useState<Tab>("species");
  const [loading, setLoading] = useState(true);

  // Species state
  const [speciesList, setSpeciesList] = useState<SpeciesItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [expandedSpecies, setExpandedSpecies] = useState<number | null>(null);
  const [editingSpecies, setEditingSpecies] = useState<SpeciesItem | null>(null);
  const [editAliases, setEditAliases] = useState<string>("");
  const [editCategory, setEditCategory] = useState<number | "">("");
  const [editScientific, setEditScientific] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingSpecies, setSavingSpecies] = useState(false);

  // Category state
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", sortOrder: 0, description: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sp, cats, sugs] = await Promise.all([
        fetch("/api/admin/species").then((r) => r.json()),
        fetch("/api/admin/species-categories").then((r) => r.json()),
        fetch("/api/admin/species-suggestions").then((r) => r.json()),
      ]);
      setSpeciesList(sp);
      setCategories(cats);
      setSuggestions(sugs);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Species ----------
  const filteredSpecies = speciesList.filter((sp) => {
    const matchesSearch = !speciesSearch || sp.name.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      (sp.scientificName && sp.scientificName.toLowerCase().includes(speciesSearch.toLowerCase()));
    const matchesCat = categoryFilter === "" || sp.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  async function startEditSpecies(sp: SpeciesItem) {
    setEditingSpecies(sp);
    setEditCategory(sp.categoryId ?? "");
    setEditScientific(sp.scientificName || "");
    setEditDescription(sp.description || "");
    // Fetch aliases
    try {
      const res = await fetch(`/api/admin/species/${sp.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditAliases((data.aliases || []).map((a: { name: string }) => a.name).join(", "));
      }
    } catch {
      setEditAliases("");
    }
  }

  async function saveSpecies() {
    if (!editingSpecies) return;
    setSavingSpecies(true);
    try {
      const aliases = editAliases.split(",").map((a) => a.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/species/${editingSpecies.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingSpecies.name,
          slug: editingSpecies.slug,
          sortOrder: editingSpecies.sortOrder,
          categoryId: editCategory || null,
          scientificName: editScientific || null,
          description: editDescription || null,
          aliases,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSpeciesList((prev) => prev.map((s) => s.id === updated.id ? {
          ...updated,
          categoryName: categories.find((c) => c.id === updated.categoryId)?.name ?? null,
        } : s));
        setEditingSpecies(null);
        toast.success("Species updated");
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setSavingSpecies(false);
    }
  }

  async function deleteSpecies(id: number) {
    if (!confirm("Delete this species? This will also remove it from all boats.")) return;
    const res = await fetch(`/api/admin/species/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSpeciesList((prev) => prev.filter((s) => s.id !== id));
      toast.success("Species deleted");
    }
  }

  // ---------- Categories ----------
  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/species-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catForm),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setCatForm({ name: "", slug: "", sortOrder: 0, description: "" });
      toast.success("Category added");
    } else {
      toast.error("Failed to add category");
    }
  }

  // ---------- Suggestions ----------
  async function updateSuggestion(id: number, status: string) {
    const res = await fetch("/api/admin/species-suggestions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      toast.success(`Suggestion ${status}`);
    }
  }

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fish className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Species Management</h1>
          <span className="text-sm text-gray-400">{speciesList.length} species</span>
        </div>
        {pendingSuggestions.length > 0 && (
          <button
            onClick={() => setTab("suggestions")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200"
          >
            <AlertCircle className="h-4 w-4" />
            {pendingSuggestions.length} pending suggestion{pendingSuggestions.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["species", "categories", "suggestions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "suggestions" && pendingSuggestions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                {pendingSuggestions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Species Tab */}
      {tab === "species" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search species..."
              value={speciesSearch}
              onChange={(e) => setSpeciesSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-64"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : "")}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400 self-center">{filteredSpecies.length} shown</span>
          </div>

          {/* Edit Panel */}
          {editingSpecies && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Edit: {editingSpecies.name}</h3>
                <button type="button" onClick={() => setEditingSpecies(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input value={editingSpecies.name} onChange={(e) => setEditingSpecies({ ...editingSpecies, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input value={editingSpecies.slug} onChange={(e) => setEditingSpecies({ ...editingSpecies, slug: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Scientific Name</label>
                  <input value={editScientific} onChange={(e) => setEditScientific(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm italic" placeholder="e.g., Lutjanus campechanus" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Aliases (comma-separated)</label>
                  <input value={editAliases} onChange={(e) => setEditAliases(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g., Bee Liner, Mingo" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SEO Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
              </div>
              <button onClick={saveSpecies} disabled={savingSpecies}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {savingSpecies ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Species Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Species</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Scientific Name</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Description</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Image</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSpecies.map((sp) => (
                  <tr key={sp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{sp.name}</span>
                      <span className="text-xs text-gray-400 ml-1">/{sp.slug}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {sp.categoryName ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{sp.categoryName}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      {sp.scientificName ? (
                        <span className="text-gray-500 italic text-xs">{sp.scientificName}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center hidden lg:table-cell">
                      {sp.description ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center hidden lg:table-cell">
                      {sp.imageUrl ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEditSpecies(sp)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteSpecies(sp.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSpecies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No species found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div className="space-y-4 max-w-2xl">
          <form onSubmit={addCategory} className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Add Category</h3>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Slug" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm" required />
              <input type="number" placeholder="Sort Order" value={catForm.sortOrder}
                onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
                className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <input placeholder="Description (optional)" value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </form>

          <div className="bg-white rounded-xl border divide-y">
            {categories.map((cat) => {
              const count = speciesList.filter((s) => s.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-6">{cat.sortOrder ?? 0}</span>
                      <span className="font-medium text-sm">{cat.name}</span>
                      <span className="text-xs text-gray-400">/{cat.slug}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{count} species</span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-400 ml-8 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No categories yet</div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <div className="space-y-4 max-w-3xl">
          {suggestions.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
              No species suggestions yet
            </div>
          ) : (
            <div className="bg-white rounded-xl border divide-y">
              {suggestions.map((sug) => (
                <div key={sug.id} className="px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-sm">{sug.speciesName}</span>
                      {sug.commonNames && (
                        <span className="ml-2 text-xs text-gray-500">Also: {sug.commonNames}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {sug.status === "pending" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                      {sug.status === "approved" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      )}
                      {sug.status === "rejected" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                          <X className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                  {sug.notes && (
                    <p className="text-xs text-gray-500">Notes: {sug.notes}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      From: {sug.operatorCompany || "Unknown"} ({sug.operatorEmail || "N/A"})
                      {" - "}
                      {new Date(sug.createdAt).toLocaleDateString()}
                    </div>
                    {sug.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSuggestion(sug.id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateSuggestion(sug.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
