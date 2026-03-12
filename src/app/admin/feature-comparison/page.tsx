"use client";

import { useEffect, useState } from "react";
import { GitCompare, Plus, Trash2, Edit, Loader2, Save, X, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Feature {
  id: number;
  featureName: string;
  description: string | null;
  icon: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

interface TierValue {
  featureId: number;
  tierId: number;
  included: boolean;
  customValue: string | null;
}

interface Tier {
  id: number;
  name: string;
  badgeColor: string | null;
}

const emptyForm = { featureName: "", description: "", icon: "", sortOrder: 0, isActive: true };

export default function AdminFeatureComparisonPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [values, setValues] = useState<TierValue[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [savingValues, setSavingValues] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/feature-comparison")
      .then((r) => r.json())
      .then((data) => {
        setFeatures(data.features || []);
        setValues(data.values || []);
        setTiers(data.tiers || []);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const sortedFeatures = [...features].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const tierValues = tiers.map((t) => ({ tierId: t.id, included: false, customValue: "" }));
    const res = await fetch("/api/admin/feature-comparison", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tierValues }),
    });
    if (res.ok) {
      const item = await res.json();
      setFeatures((prev) => [...prev, item]);
      setForm(emptyForm);
      setShowAdd(false);
      toast.success("Feature added");
    }
  }

  async function handleUpdateFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const featureValues = values.filter((v) => v.featureId === editing.id);
    const tierValues = tiers.map((t) => {
      const existing = featureValues.find((v) => v.tierId === t.id);
      return { tierId: t.id, included: existing?.included ?? false, customValue: existing?.customValue || "" };
    });
    const res = await fetch(`/api/admin/feature-comparison/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        featureName: editing.featureName,
        description: editing.description,
        icon: editing.icon,
        sortOrder: editing.sortOrder,
        isActive: editing.isActive,
        tierValues,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      setFeatures((prev) => prev.map((f) => (f.id === item.id ? item : f)));
      setEditing(null);
      toast.success("Feature updated");
    }
  }

  async function toggleValue(featureId: number, tierId: number, currentlyIncluded: boolean) {
    const key = `${featureId}-${tierId}`;
    setSavingValues(key);
    const featureValues = values.filter((v) => v.featureId === featureId);
    const updatedValues = tiers.map((t) => {
      const existing = featureValues.find((v) => v.tierId === t.id);
      return {
        tierId: t.id,
        included: t.id === tierId ? !currentlyIncluded : (existing?.included ?? false),
        customValue: existing?.customValue || "",
      };
    });
    const res = await fetch(`/api/admin/feature-comparison/${featureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierValues: updatedValues }),
    });
    if (res.ok) {
      setValues((prev) => {
        const filtered = prev.filter((v) => v.featureId !== featureId);
        return [...filtered, ...updatedValues.map((v) => ({ ...v, featureId }))];
      });
    }
    setSavingValues(null);
  }

  async function updateCustomValue(featureId: number, tierId: number, customValue: string) {
    const featureValues = values.filter((v) => v.featureId === featureId);
    const updatedValues = tiers.map((t) => {
      const existing = featureValues.find((v) => v.tierId === t.id);
      return {
        tierId: t.id,
        included: existing?.included ?? false,
        customValue: t.id === tierId ? customValue : (existing?.customValue || ""),
      };
    });
    // Update local state immediately
    setValues((prev) => {
      const filtered = prev.filter((v) => v.featureId !== featureId);
      return [...filtered, ...updatedValues.map((v) => ({ ...v, featureId }))];
    });
  }

  async function saveCustomValue(featureId: number) {
    const featureValues = values.filter((v) => v.featureId === featureId);
    const updatedValues = tiers.map((t) => {
      const existing = featureValues.find((v) => v.tierId === t.id);
      return {
        tierId: t.id,
        included: existing?.included ?? false,
        customValue: existing?.customValue || "",
      };
    });
    await fetch(`/api/admin/feature-comparison/${featureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierValues: updatedValues }),
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this feature?")) return;
    const res = await fetch(`/api/admin/feature-comparison/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      setValues((prev) => prev.filter((v) => v.featureId !== id));
      toast.success("Feature deleted");
    }
  }

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
          <GitCompare className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Feature Comparison</h1>
            <p className="text-sm text-gray-500">Manage features shown on the tier comparison table</p>
          </div>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Feature
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <FeatureForm
          title="New Feature"
          data={form}
          onChange={setForm}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel="Create Feature"
        />
      )}

      {/* Edit Form */}
      {editing && (
        <FeatureForm
          title={`Edit: ${editing.featureName}`}
          data={{
            featureName: editing.featureName,
            description: editing.description || "",
            icon: editing.icon || "",
            sortOrder: editing.sortOrder ?? 0,
            isActive: editing.isActive,
          }}
          onChange={(d) => setEditing({ ...editing, ...d })}
          onSubmit={handleUpdateFeature}
          onCancel={() => setEditing(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Tier Legend */}
      <div className="flex items-center gap-4">
        {tiers.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: t.badgeColor || "#6b7280" }}
            />
            <span className="text-sm font-medium text-gray-700">{t.name}</span>
          </div>
        ))}
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {sortedFeatures.map((f) => {
          const featureValues = values.filter((v) => v.featureId === f.id);
          return (
            <div
              key={f.id}
              className={`bg-white rounded-xl border p-4 ${!f.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Drag handle + Feature info */}
                <div className="flex items-center gap-2 text-gray-300 pt-0.5">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">
                      {f.icon && <span className="mr-1.5">{f.icon}</span>}
                      {f.featureName}
                    </h3>
                    {!f.isActive && (
                      <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                        Inactive
                      </span>
                    )}
                    <span className="text-xs text-gray-400">#{f.sortOrder ?? 0}</span>
                  </div>
                  {f.description && (
                    <p className="text-xs text-gray-500 mb-3">{f.description}</p>
                  )}

                  {/* Tier toggles */}
                  <div className="flex items-center gap-6">
                    {tiers.map((t) => {
                      const val = featureValues.find((v) => v.tierId === t.id);
                      const isIncluded = val?.included ?? false;
                      const isSaving = savingValues === `${f.id}-${t.id}`;
                      return (
                        <div key={t.id} className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">{t.name}</span>
                          <button
                            onClick={() => toggleValue(f.id, t.id, isIncluded)}
                            disabled={isSaving}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isIncluded
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-gray-200 hover:border-gray-300 text-gray-200"
                            } ${isSaving ? "opacity-50" : ""}`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <input
                            type="text"
                            value={val?.customValue || ""}
                            onChange={(e) => updateCustomValue(f.id, t.id, e.target.value)}
                            onBlur={() => saveCustomValue(f.id)}
                            placeholder="Custom"
                            className="w-24 text-center border rounded-md px-2 py-1 text-xs text-gray-600 placeholder:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(f); setShowAdd(false); }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {features.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <GitCompare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">No features yet</p>
            <p className="text-xs text-gray-400">Add features to build your tier comparison table</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureForm({
  title,
  data,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  title: string;
  data: { featureName: string; description: string; icon: string; sortOrder: number; isActive: boolean };
  onChange: (d: { featureName: string; description: string; icon: string; sortOrder: number; isActive: boolean }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
          <input
            value={data.featureName}
            onChange={(e) => onChange({ ...data, featureName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <input
            value={data.icon}
            onChange={(e) => onChange({ ...data, icon: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
            placeholder="e.g. check, star"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
          placeholder="Brief description of this feature"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={data.sortOrder}
            onChange={(e) => onChange({ ...data, sortOrder: Number(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm pt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
            className="rounded border-gray-300"
          />
          Active
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Save className="h-4 w-4" /> {submitLabel}
        </button>
      </div>
    </form>
  );
}
