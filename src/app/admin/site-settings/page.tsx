"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface SiteSettingsData {
  siteName: string;
  siteTagline: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  heroTransitionDuration: number;
  logoUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  featuredColumn: string;
  featuredColumnLabel: string;
  showPostDates: boolean;
}

const defaults: SiteSettingsData = {
  siteName: "",
  siteTagline: "",
  heroImageUrl: "",
  heroVideoUrl: "",
  heroTransitionDuration: 5000,
  logoUrl: "",
  heroHeadline: "",
  heroSubheadline: "",
  featuredColumn: "",
  featuredColumnLabel: "",
  showPostDates: true,
};

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaults);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [newHeroImage, setNewHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
          if (Array.isArray(data.heroImages)) {
            setHeroImages(data.heroImages);
          }
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, heroImages }),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error("Failed to save");
  }

  function addHeroImage() {
    if (newHeroImage.trim()) {
      setHeroImages((prev) => [...prev, newHeroImage.trim()]);
      setNewHeroImage("");
    }
  }

  function removeHeroImage(index: number) {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
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
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Site Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* General */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName || ""}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.siteTagline || ""}
                onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={settings.logoUrl || ""}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Column</label>
              <input
                type="text"
                value={settings.featuredColumn || ""}
                onChange={(e) => setSettings({ ...settings, featuredColumn: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Column Label</label>
              <input
                type="text"
                value={settings.featuredColumnLabel || ""}
                onChange={(e) => setSettings({ ...settings, featuredColumnLabel: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showPostDates"
              checked={settings.showPostDates ?? true}
              onChange={(e) => setSettings({ ...settings, showPostDates: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="showPostDates" className="text-sm font-medium text-gray-700">Show Post Dates</label>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Hero Section</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label>
            <input
              type="text"
              value={settings.heroHeadline || ""}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subheadline</label>
            <input
              type="text"
              value={settings.heroSubheadline || ""}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
            <input
              type="url"
              value={settings.heroImageUrl || ""}
              onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Video URL</label>
            <input
              type="url"
              value={settings.heroVideoUrl || ""}
              onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Transition Duration (ms)</label>
            <input
              type="number"
              value={settings.heroTransitionDuration || 5000}
              onChange={(e) => setSettings({ ...settings, heroTransitionDuration: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Hero Images Array */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Slideshow Images</label>
            <div className="space-y-2">
              {heroImages.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600"
                  />
                  <button type="button" onClick={() => removeHeroImage(i)} className="text-red-500 hover:bg-red-50 rounded p-1.5 text-sm">Remove</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newHeroImage}
                  onChange={(e) => setNewHeroImage(e.target.value)}
                  placeholder="Add image URL..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={addHeroImage} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
