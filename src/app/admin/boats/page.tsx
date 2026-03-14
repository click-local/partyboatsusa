"use client";

import { useEffect, useMemo, useState } from "react";
import { Ship, Plus, Trash2, Edit, Loader2, ChevronLeft, ChevronRight, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatImageUrl } from "@/lib/utils";

interface Boat {
  id: number;
  name: string;
  slug: string;
  cityName: string;
  stateCode: string;
  isPublished: boolean;
  isFeatured: boolean;
  isFeaturedAdmin: boolean;
  operatorName: string;
  operatorId: number | null;
  primaryImageUrl: string | null;
  rating: string;
  reviewCount: number;
  capacity: number;
  minPricePerPerson: string;
}

const PAGE_SIZE = 50;

export default function AdminBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"" | "yes" | "no">("");
  const [featuredFilter, setFeaturedFilter] = useState<"" | "yes" | "no">("");
  const [claimedFilter, setClaimedFilter] = useState<"" | "yes" | "no">("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/admin/boats")
      .then((r) => r.json())
      .then(setBoats)
      .catch(() => toast.error("Failed to load boats"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this boat? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/boats/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBoats((prev) => prev.filter((b) => b.id !== id));
      toast.success("Boat deleted");
    } else {
      toast.error("Failed to delete boat");
    }
  }

  async function toggleField(id: number, field: string, currentValue: boolean) {
    const res = await fetch(`/api/admin/boats/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !currentValue }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBoats((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
      toast.success(`${field === "isPublished" ? (updated.isPublished ? "Published" : "Unpublished") : (updated.isFeaturedAdmin ? "Featured" : "Unfeatured")}`);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((b) => b.id)));
    }
  }

  async function bulkAction(field: string, value: boolean) {
    const ids = [...selected];
    if (!ids.length) return;
    const label = field === "isPublished" ? (value ? "publish" : "unpublish") : (value ? "feature" : "unfeature");
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${ids.length} boats?`)) return;

    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/admin/boats/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        }).then((r) => r.json())
      )
    );

    let successCount = 0;
    setBoats((prev) =>
      prev.map((b) => {
        const result = results[ids.indexOf(b.id)];
        if (result?.status === "fulfilled") {
          successCount++;
          return { ...b, ...result.value };
        }
        return b;
      })
    );
    setSelected(new Set());
    toast.success(`${successCount} boats updated`);
  }

  async function bulkDelete() {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} boats? This cannot be undone.`)) return;

    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/admin/boats/${id}`, { method: "DELETE" }))
    );

    const deleted = ids.filter((_, i) => results[i]?.status === "fulfilled");
    setBoats((prev) => prev.filter((b) => !deleted.includes(b.id)));
    setSelected(new Set());
    toast.success(`${deleted.length} boats deleted`);
  }

  // Derive unique states from loaded boats
  const stateOptions = useMemo(
    () => [...new Set(boats.map((b) => b.stateCode).filter(Boolean))].sort(),
    [boats]
  );

  // Filter pipeline
  const filtered = useMemo(() => {
    let result = boats;

    // Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.cityName?.toLowerCase().includes(q) ||
          b.stateCode?.toLowerCase().includes(q) ||
          b.operatorName?.toLowerCase().includes(q)
      );
    }

    // State filter
    if (stateFilter) {
      result = result.filter((b) => b.stateCode === stateFilter);
    }

    // Published filter
    if (publishedFilter === "yes") result = result.filter((b) => b.isPublished);
    if (publishedFilter === "no") result = result.filter((b) => !b.isPublished);

    // Featured filter
    if (featuredFilter === "yes") result = result.filter((b) => b.isFeaturedAdmin);
    if (featuredFilter === "no") result = result.filter((b) => !b.isFeaturedAdmin);

    // Claimed filter
    if (claimedFilter === "yes") result = result.filter((b) => b.operatorId != null);
    if (claimedFilter === "no") result = result.filter((b) => b.operatorId == null);

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aVal: string | number, bVal: string | number;
        switch (sortKey) {
          case "name": aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
          case "location": aVal = `${a.stateCode} ${a.cityName}`.toLowerCase(); bVal = `${b.stateCode} ${b.cityName}`.toLowerCase(); break;
          case "capacity": aVal = a.capacity; bVal = b.capacity; break;
          case "price": aVal = Number(a.minPricePerPerson); bVal = Number(b.minPricePerPerson); break;
          case "rating": aVal = Number(a.rating); bVal = Number(b.rating); break;
          default: return 0;
        }
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [boats, search, stateFilter, publishedFilter, featuredFilter, claimedFilter, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, stateFilter, publishedFilter, featuredFilter, claimedFilter]);

  const hasActiveFilters = search || stateFilter || publishedFilter || featuredFilter || claimedFilter;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortHeader({ label, sortField, align = "left" }: { label: string; sortField: string; align?: "left" | "center" }) {
    const active = sortKey === sortField;
    return (
      <th
        className={`${align === "center" ? "text-center" : "text-left"} px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none`}
        onClick={() => toggleSort(sortField)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active ? (
            sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30" />
          )}
        </span>
      </th>
    );
  }

  function clearFilters() {
    setSearch("");
    setStateFilter("");
    setPublishedFilter("");
    setFeaturedFilter("");
    setClaimedFilter("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ship className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Boats</h1>
          <span className="text-sm text-gray-500">
            {hasActiveFilters
              ? `(${filtered.length} of ${boats.length})`
              : `(${boats.length})`}
          </span>
        </div>
        <Link href="/admin/boats/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" /> Add Boat
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search boats by name, city, state, or operator..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm"
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All States</option>
          {stateOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value as "" | "yes" | "no")}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="yes">Published</option>
          <option value="no">Unpublished</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value as "" | "yes" | "no")}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Featured</option>
          <option value="yes">Featured</option>
          <option value="no">Not Featured</option>
        </select>

        <select
          value={claimedFilter}
          onChange={(e) => setClaimedFilter(e.target.value as "" | "yes" | "no")}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All Listings</option>
          <option value="yes">Claimed</option>
          <option value="no">Unclaimed</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <div className="h-4 w-px bg-blue-200" />
          <button onClick={() => bulkAction("isPublished", true)} className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200">
            Publish
          </button>
          <button onClick={() => bulkAction("isPublished", false)} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
            Unpublish
          </button>
          <button onClick={() => bulkAction("isFeaturedAdmin", true)} className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
            Feature
          </button>
          <button onClick={() => bulkAction("isFeaturedAdmin", false)} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
            Unfeature
          </button>
          <button onClick={bulkDelete} className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200">
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 hover:underline">
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selected.size === paginated.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <SortHeader label="Boat" sortField="name" />
              <SortHeader label="Location" sortField="location" />
              <th className="text-left px-4 py-3 font-medium text-gray-600">Operator</th>
              <SortHeader label="Capacity" sortField="capacity" align="center" />
              <SortHeader label="Price" sortField="price" align="center" />
              <SortHeader label="Rating" sortField="rating" align="center" />
              <th className="text-center px-4 py-3 font-medium text-gray-600">Published</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.map((boat) => (
              <tr key={boat.id} className={`hover:bg-gray-50 ${selected.has(boat.id) ? "bg-blue-50/50" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(boat.id)}
                    onChange={() => toggleSelect(boat.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {boat.primaryImageUrl && (
                      <img src={formatImageUrl(boat.primaryImageUrl)} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{boat.name}</div>
                      <div className="text-xs text-gray-400">/{boat.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{boat.cityName}, {boat.stateCode}</td>
                <td className="px-4 py-3 text-gray-600">{boat.operatorName || <span className="text-gray-400 italic">Unclaimed</span>}</td>
                <td className="px-4 py-3 text-center text-gray-600">{boat.capacity}</td>
                <td className="px-4 py-3 text-center text-gray-600">${boat.minPricePerPerson}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-yellow-600">{boat.rating}</span>
                  <span className="text-gray-400 text-xs ml-1">({boat.reviewCount})</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleField(boat.id, "isPublished", boat.isPublished)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${boat.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {boat.isPublished ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleField(boat.id, "isFeaturedAdmin", boat.isFeaturedAdmin)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${boat.isFeaturedAdmin ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                    {boat.isFeaturedAdmin ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/admin/boats/${boat.id}`} className="inline-flex p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(boat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                  {hasActiveFilters ? "No boats match your filters." : "No boats yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} boats
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
