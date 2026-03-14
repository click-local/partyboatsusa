"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, Plus, Trash2, Edit, Loader2, Save, X, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface DestPage {
  id: number;
  type: string;
  referenceId: number;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  heroImageUrl: string | null;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  cardImageUrl: string | null;
}

interface StateItem { id: number; name: string; code: string; slug: string }
interface CityItem { id: number; name: string; slug: string; stateCode: string }

const emptyForm = {
  type: "state",
  referenceId: 0,
  isPublished: true,
};

export default function AdminDestinationPagesPage() {
  const [pages, setPages] = useState<DestPage[]>([]);
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "published" | "draft">("");

  async function handleSyncCities() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-cities", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        const parts: string[] = [];
        if (result.citiesAdded > 0) parts.push(`${result.citiesAdded} cities`);
        if (result.pagesAdded > 0) parts.push(`${result.pagesAdded} destination pages`);
        if (parts.length > 0) {
          toast.success(`Added ${parts.join(" and ")}`);
          // Refresh full list
          const refreshRes = await fetch("/api/admin/destination-pages");
          const data = await refreshRes.json();
          setPages(Array.isArray(data.pages) ? data.pages : []);
          setCitiesList(Array.isArray(data.cities) ? data.cities : []);
        } else {
          toast.info("Everything already synced");
        }
      } else {
        toast.error("Sync failed");
      }
    } catch { toast.error("Sync failed"); }
    finally { setSyncing(false); }
  }

  useEffect(() => {
    fetch("/api/admin/destination-pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(Array.isArray(data.pages) ? data.pages : []);
        setStatesList(Array.isArray(data.states) ? data.states : []);
        setCitiesList(Array.isArray(data.cities) ? data.cities : []);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function getReferenceName(type: string, refId: number): string {
    if (type === "state") {
      const st = statesList.find((s) => s.id === refId);
      return st ? st.name : `State #${refId}`;
    }
    if (type === "city") {
      const ct = citiesList.find((c) => c.id === refId);
      if (ct) {
        const st = statesList.find((s) => s.code === ct.stateCode);
        return `${ct.name}, ${st?.code || ct.stateCode}`;
      }
      return `City #${refId}`;
    }
    return `#${refId}`;
  }

  function getSlugPath(type: string, refId: number): string | null {
    if (type === "state") {
      const st = statesList.find((s) => s.id === refId);
      return st ? `/destinations/${st.slug}` : null;
    }
    if (type === "city") {
      const ct = citiesList.find((c) => c.id === refId);
      if (ct) {
        const st = statesList.find((s) => s.code === ct.stateCode);
        return st ? `/destinations/${st.slug}/${ct.slug}` : null;
      }
    }
    return null;
  }

  function seoScore(page: DestPage): { filled: number; total: number } {
    const fields = [page.seoTitle, page.seoDescription, page.seoKeywords, page.heroHeadline, page.heroSubheadline, page.heroImageUrl, page.cardImageUrl];
    return { filled: fields.filter(Boolean).length, total: fields.length };
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.referenceId) { toast.error("Please select a state or city"); return; }
    const res = await fetch("/api/admin/destination-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const page = await res.json();
      setPages((prev) => [page, ...prev]);
      setForm(emptyForm);
      setShowAdd(false);
      toast.success("Page created. Redirecting to editor...");
      window.location.href = `/admin/destination-pages/${page.id}`;
    } else {
      toast.error("Failed to create page");
    }
  }

  async function togglePublish(page: DestPage) {
    const res = await fetch(`/api/admin/destination-pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(updated.isPublished ? "Published" : "Unpublished");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this destination page and all its content blocks?")) return;
    const res = await fetch(`/api/admin/destination-pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Page deleted");
    }
  }

  const filteredPages = useMemo(() => {
    let result = pages;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const name = getReferenceName(p.type, p.referenceId).toLowerCase();
        return (
          name.includes(q) ||
          (p.heroHeadline || "").toLowerCase().includes(q) ||
          (p.seoTitle || "").toLowerCase().includes(q)
        );
      });
    }
    if (typeFilter) result = result.filter((p) => p.type === typeFilter);
    if (statusFilter === "published") result = result.filter((p) => p.isPublished);
    if (statusFilter === "draft") result = result.filter((p) => !p.isPublished);
    return result;
  }, [pages, search, typeFilter, statusFilter, statesList, citiesList]);

  const hasActiveFilters = search || typeFilter || statusFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Destination Pages</h1>
          <span className="text-sm text-gray-400">
            {hasActiveFilters ? `${filteredPages.length} of ${pages.length}` : pages.length} pages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSyncCities} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sync All
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" /> Add Page
          </button>
        </div>
      </div>

      {/* Quick-create form - just pick type + reference, then redirect to full editor */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Destination Page</h2>
            <button type="button" onClick={() => setShowAdd(false)} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, referenceId: 0 })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="state">State</option>
                <option value="city">City</option>
                <option value="region">Region</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === "state" ? "State" : form.type === "city" ? "City" : "Reference ID"}
              </label>
              {form.type === "state" ? (
                <select value={form.referenceId || ""} onChange={(e) => setForm({ ...form, referenceId: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select State...</option>
                  {statesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              ) : form.type === "city" ? (
                citiesList.length > 0 ? (
                  <select value={form.referenceId || ""} onChange={(e) => setForm({ ...form, referenceId: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Select City...</option>
                    {citiesList.map((c) => {
                      const st = statesList.find((s) => s.code === c.stateCode);
                      return (
                        <option key={c.id} value={c.id}>{c.name}, {st?.code || c.stateCode}</option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-sm text-amber-600 py-2">No cities in database. Click &quot;Sync Cities&quot; above to import from boat data.</p>
                )
              ) : (
                <input type="number" value={form.referenceId || ""} onChange={(e) => setForm({ ...form, referenceId: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Reference ID" />
              )}
            </div>
            <div className="flex items-end">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Save className="h-4 w-4" /> Create & Edit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search destinations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Types</option>
          <option value="state">State</option>
          <option value="city">City</option>
          <option value="region">Region</option>
          <option value="custom">Custom</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "published" | "draft")}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Image</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Destination</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Headline</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SEO</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPages.map((page) => {
              const name = getReferenceName(page.type, page.referenceId);
              const score = seoScore(page);
              const slugPath = getSlugPath(page.type, page.referenceId);
              return (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {page.cardImageUrl ? (
                      <Image src={page.cardImageUrl} alt={name} width={64} height={40} className="h-10 w-16 rounded object-cover border" />
                    ) : (
                      <div className="h-10 w-16 rounded bg-gray-100 flex items-center justify-center">
                        <Map className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/destination-pages/${page.id}`} className="font-medium text-blue-600 hover:underline">{name}</Link>
                    {slugPath && (
                      <div className="text-xs text-gray-400">{slugPath}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{page.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                    {page.heroHeadline || <span className="text-gray-300 italic">Not set</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {score.filled === score.total ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="text-xs text-gray-500">{score.filled}/{score.total}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(page)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${page.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {page.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {slugPath && (
                      <a href={slugPath} target="_blank" rel="noopener noreferrer" className="inline-flex p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/admin/destination-pages/${page.id}`} className="inline-flex p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(page.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
            {filteredPages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {hasActiveFilters ? "No pages match your filters." : "No destination pages yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
