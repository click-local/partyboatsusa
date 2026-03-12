"use client";

import { useEffect, useState } from "react";
import { Crown, Plus, Trash2, Edit, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Tier {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: string | null;
  yearlyPrice: string | null;
  searchBoost: number | null;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showBookingUrl: boolean;
  showSocialMedia: boolean;
  displayBadge: boolean;
  badgeColor: string | null;
  sortOrder: number | null;
  isHighestTier: boolean;
  showAnalytics: boolean;
}

const emptyForm = {
  name: "", description: "", monthlyPrice: "", yearlyPrice: "",
  searchBoost: 0, showPhone: false, showEmail: false, showWebsite: false,
  showBookingUrl: false, showSocialMedia: false, displayBadge: false,
  badgeColor: "#3B82F6", sortOrder: 0, isHighestTier: false, showAnalytics: false,
};

export default function AdminMembershipTiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tier | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/admin/membership-tiers")
      .then((r) => r.json())
      .then(setTiers)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      monthlyPrice: form.monthlyPrice || null,
      yearlyPrice: form.yearlyPrice || null,
    };
    const res = await fetch("/api/admin/membership-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const tier = await res.json();
      setTiers((prev) => [...prev, tier]);
      setForm(emptyForm);
      setShowAdd(false);
      toast.success("Tier created");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/membership-tiers/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const t = await res.json();
      setTiers((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      setEditing(null);
      toast.success("Tier updated");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this tier?")) return;
    const res = await fetch(`/api/admin/membership-tiers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTiers((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tier deleted");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  function TierFormPanel({ data, onChange, onSubmit, title, submitLabel, onCancel }: {
    data: Record<string, unknown>;
    onChange: (d: Record<string, unknown>) => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitLabel: string;
    onCancel?: () => void;
  }) {
    return (
      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          {onCancel && <button type="button" onClick={onCancel} className="p-1 text-gray-400"><X className="h-4 w-4" /></button>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={(data.name as string) || ""} onChange={(e) => onChange({ ...data, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={(data.badgeColor as string) || "#3B82F6"} onChange={(e) => onChange({ ...data, badgeColor: e.target.value })} className="h-9 w-12 border rounded" />
              <span className="text-sm text-gray-500">{(data.badgeColor as string) || "#3B82F6"}</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={(data.description as string) || ""} onChange={(e) => onChange({ ...data, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
            <input type="text" value={(data.monthlyPrice as string) || ""} onChange={(e) => onChange({ ...data, monthlyPrice: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price</label>
            <input type="text" value={(data.yearlyPrice as string) || ""} onChange={(e) => onChange({ ...data, yearlyPrice: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input type="number" value={(data.sortOrder as number) ?? 0} onChange={(e) => onChange({ ...data, sortOrder: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Boost</label>
          <input type="number" value={(data.searchBoost as number) ?? 0} onChange={(e) => onChange({ ...data, searchBoost: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm max-w-xs" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Flags</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              ["showPhone", "Show Phone"],
              ["showEmail", "Show Email"],
              ["showWebsite", "Show Website"],
              ["showBookingUrl", "Show Booking URL"],
              ["showSocialMedia", "Show Social Media"],
              ["displayBadge", "Display Badge"],
              ["showAnalytics", "Show Analytics"],
              ["isHighestTier", "Highest Tier"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!data[key]} onChange={(e) => onChange({ ...data, [key]: e.target.checked })} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Save className="h-4 w-4" /> {submitLabel}
        </button>
      </form>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Membership Tiers</h1>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" /> Add Tier
        </button>
      </div>

      {showAdd && (
        <TierFormPanel
          data={form as unknown as Record<string, unknown>}
          onChange={(d) => setForm(d as unknown as typeof emptyForm)}
          onSubmit={handleAdd}
          title="New Tier"
          submitLabel="Create"
          onCancel={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <TierFormPanel
          data={editing as unknown as Record<string, unknown>}
          onChange={(d) => setEditing(d as unknown as Tier)}
          onSubmit={handleUpdate}
          title={`Edit: ${editing.name}`}
          submitLabel="Save Changes"
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid gap-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.badgeColor || "#3B82F6" }} />
                <div>
                  <span className="font-medium">{tier.name}</span>
                  {tier.monthlyPrice && <span className="text-sm text-gray-400 ml-2">${tier.monthlyPrice}/mo</span>}
                  {tier.yearlyPrice && <span className="text-sm text-gray-400 ml-2">${tier.yearlyPrice}/yr</span>}
                  {!tier.monthlyPrice && !tier.yearlyPrice && <span className="text-sm text-gray-400 ml-2">Free</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(tier); setShowAdd(false); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(tier.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {tier.description && <p className="text-sm text-gray-500 mt-2">{tier.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {tier.showPhone && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Phone</span>}
              {tier.showEmail && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Email</span>}
              {tier.showWebsite && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Website</span>}
              {tier.showBookingUrl && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Booking</span>}
              {tier.showSocialMedia && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Social</span>}
              {tier.displayBadge && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Badge</span>}
              {tier.showAnalytics && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Analytics</span>}
              {tier.isHighestTier && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Highest</span>}
            </div>
          </div>
        ))}
        {tiers.length === 0 && <div className="text-center text-gray-400 py-8">No membership tiers yet.</div>}
      </div>
    </div>
  );
}
