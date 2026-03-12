"use client";

import { useEffect, useState } from "react";
import { Ship, Plus, Trash2, Edit, Loader2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  primaryImageUrl: string | null;
  rating: string;
  reviewCount: number;
  capacity: number;
  minPricePerPerson: string;
}

export default function AdminBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = boats.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.cityName?.toLowerCase().includes(search.toLowerCase()) ||
    b.stateCode?.toLowerCase().includes(search.toLowerCase()) ||
    b.operatorName?.toLowerCase().includes(search.toLowerCase())
  );

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
          <Ship className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Boats</h1>
          <span className="text-sm text-gray-500">({boats.length})</span>
        </div>
        <Link href="/admin/boats/add" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" /> Add Boat
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search boats by name, city, state, or operator..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm"
      />

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Boat</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Operator</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Capacity</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Rating</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Published</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((boat) => (
              <tr key={boat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {boat.primaryImageUrl && (
                      <img src={boat.primaryImageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{boat.name}</div>
                      <div className="text-xs text-gray-400">/{boat.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{boat.cityName}, {boat.stateCode}</td>
                <td className="px-4 py-3 text-gray-600">{boat.operatorName}</td>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  {search ? "No boats match your search." : "No boats yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
