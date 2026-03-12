"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Edit, Loader2, Save, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface TripType { id: number; name: string; slug: string; sortOrder: number | null; }
interface Amenity { id: number; name: string; slug: string; icon: string; sortOrder: number | null; }

export default function AdminOptionsPage() {
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [ttForm, setTtForm] = useState({ name: "", slug: "", sortOrder: 0 });
  const [amForm, setAmForm] = useState({ name: "", slug: "", icon: "", sortOrder: 0 });
  const [editingTt, setEditingTt] = useState<TripType | null>(null);
  const [editingAm, setEditingAm] = useState<Amenity | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/trip-types").then((r) => r.json()),
      fetch("/api/admin/amenities").then((r) => r.json()),
    ])
      .then(([tt, am]) => { setTripTypes(tt); setAmenities(am); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function addTripType(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/trip-types", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ttForm),
    });
    if (res.ok) {
      const tt = await res.json();
      setTripTypes((prev) => [...prev, tt]);
      setTtForm({ name: "", slug: "", sortOrder: 0 });
      toast.success("Trip type added");
    }
  }

  async function updateTripType(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTt) return;
    const res = await fetch(`/api/admin/trip-types/${editingTt.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingTt.name, slug: editingTt.slug, sortOrder: editingTt.sortOrder }),
    });
    if (res.ok) {
      const tt = await res.json();
      setTripTypes((prev) => prev.map((t) => (t.id === tt.id ? tt : t)));
      setEditingTt(null);
      toast.success("Updated");
    }
  }

  async function deleteTripType(id: number) {
    if (!confirm("Delete this trip type?")) return;
    const res = await fetch(`/api/admin/trip-types/${id}`, { method: "DELETE" });
    if (res.ok) { setTripTypes((prev) => prev.filter((t) => t.id !== id)); toast.success("Deleted"); }
  }

  async function addAmenity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/amenities", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(amForm),
    });
    if (res.ok) {
      const am = await res.json();
      setAmenities((prev) => [...prev, am]);
      setAmForm({ name: "", slug: "", icon: "", sortOrder: 0 });
      toast.success("Amenity added");
    }
  }

  async function updateAmenity(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAm) return;
    const res = await fetch(`/api/admin/amenities/${editingAm.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingAm.name, slug: editingAm.slug, icon: editingAm.icon, sortOrder: editingAm.sortOrder }),
    });
    if (res.ok) {
      const am = await res.json();
      setAmenities((prev) => prev.map((a) => (a.id === am.id ? am : a)));
      setEditingAm(null);
      toast.success("Updated");
    }
  }

  async function deleteAmenity(id: number) {
    if (!confirm("Delete this amenity?")) return;
    const res = await fetch(`/api/admin/amenities/${id}`, { method: "DELETE" });
    if (res.ok) { setAmenities((prev) => prev.filter((a) => a.id !== id)); toast.success("Deleted"); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Options</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Trip Types */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Trip Types</h2>
          <form onSubmit={addTripType} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Name" value={ttForm.name} onChange={(e) => setTtForm({ ...ttForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Slug" value={ttForm.slug} onChange={(e) => setTtForm({ ...ttForm, slug: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
              <input type="number" placeholder="Order" value={ttForm.sortOrder} onChange={(e) => setTtForm({ ...ttForm, sortOrder: Number(e.target.value) })} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus className="h-4 w-4" /> Add</button>
          </form>

          {editingTt && (
            <form onSubmit={updateTripType} className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Edit Trip Type</span>
                <button type="button" onClick={() => setEditingTt(null)} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={editingTt.name} onChange={(e) => setEditingTt({ ...editingTt, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                <input value={editingTt.slug} onChange={(e) => setEditingTt({ ...editingTt, slug: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                <input type="number" value={editingTt.sortOrder ?? 0} onChange={(e) => setEditingTt({ ...editingTt, sortOrder: Number(e.target.value) })} className="border rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Save className="h-4 w-4" /> Save</button>
            </form>
          )}

          <div className="bg-white rounded-xl border divide-y">
            {tripTypes.map((tt) => (
              <div key={tt.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">{tt.sortOrder ?? 0}</span>
                  <span className="font-medium text-sm">{tt.name}</span>
                  <span className="text-xs text-gray-400">/{tt.slug}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingTt(tt)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteTripType(tt.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {tripTypes.length === 0 && <div className="px-4 py-4 text-center text-gray-400 text-sm">No trip types</div>}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Amenities</h2>
          <form onSubmit={addAmenity} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <input placeholder="Name" value={amForm.name} onChange={(e) => setAmForm({ ...amForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Slug" value={amForm.slug} onChange={(e) => setAmForm({ ...amForm, slug: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Icon" value={amForm.icon} onChange={(e) => setAmForm({ ...amForm, icon: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
              <input type="number" placeholder="Order" value={amForm.sortOrder} onChange={(e) => setAmForm({ ...amForm, sortOrder: Number(e.target.value) })} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus className="h-4 w-4" /> Add</button>
          </form>

          {editingAm && (
            <form onSubmit={updateAmenity} className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Edit Amenity</span>
                <button type="button" onClick={() => setEditingAm(null)} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input value={editingAm.name} onChange={(e) => setEditingAm({ ...editingAm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                <input value={editingAm.slug} onChange={(e) => setEditingAm({ ...editingAm, slug: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
                <input value={editingAm.icon} onChange={(e) => setEditingAm({ ...editingAm, icon: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={editingAm.sortOrder ?? 0} onChange={(e) => setEditingAm({ ...editingAm, sortOrder: Number(e.target.value) })} className="border rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Save className="h-4 w-4" /> Save</button>
            </form>
          )}

          <div className="bg-white rounded-xl border divide-y">
            {amenities.map((am) => (
              <div key={am.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">{am.sortOrder ?? 0}</span>
                  <span className="text-sm mr-1">{am.icon}</span>
                  <span className="font-medium text-sm">{am.name}</span>
                  <span className="text-xs text-gray-400">/{am.slug}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingAm(am)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteAmenity(am.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {amenities.length === 0 && <div className="px-4 py-4 text-center text-gray-400 text-sm">No amenities</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
