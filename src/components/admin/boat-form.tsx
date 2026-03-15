"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, X, Plus, Eye } from "lucide-react";
import { SpeciesSelect } from "@/components/species-select";
import { ImageManager } from "./image-manager";

export interface BoatData {
  name: string;
  operatorName: string;
  slug: string;
  descriptionShort: string;
  descriptionLong: string;
  stateCode: string;
  cityName: string;
  portName: string;
  streetAddress: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  minPricePerPerson: string;
  maxPricePerPerson: string;
  capacity: number;
  phone: string;
  email: string;
  websiteUrl: string;
  bookingUrl: string;
  bookingLinkTarget: string;
  bookingButtonText: string;
  socialX: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  isFeatured: boolean;
  isFeaturedAdmin: boolean;
  isPublished: boolean;
  primaryImageUrl: string;
  imageFocalPointX: number;
  imageFocalPointY: number;
  galleryImageUrls: string[];
  targetSpecies: string[];
  whatsIncluded: string[];
  availableExtras: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  tripTypeIds: number[];
  amenityIds: number[];
  speciesIds: number[];
}

interface TripType { id: number; name: string; }
interface Amenity { id: number; name: string; icon: string; }
interface State { id: number; name: string; code: string; }

const emptyBoat: BoatData = {
  name: "", operatorName: "", slug: "", descriptionShort: "", descriptionLong: "",
  stateCode: "", cityName: "", portName: "", streetAddress: "", zipCode: "",
  latitude: "", longitude: "", minPricePerPerson: "", maxPricePerPerson: "",
  capacity: 0, phone: "", email: "", websiteUrl: "", bookingUrl: "",
  bookingLinkTarget: "_modal", bookingButtonText: "Book Now",
  socialX: "", socialFacebook: "", socialInstagram: "", socialYoutube: "",
  isFeatured: false, isFeaturedAdmin: false, isPublished: true,
  primaryImageUrl: "", imageFocalPointX: 50, imageFocalPointY: 50,
  galleryImageUrls: [], targetSpecies: [], whatsIncluded: [], availableExtras: [],
  seoTitle: "", seoDescription: "", seoKeywords: "",
  tripTypeIds: [], amenityIds: [], speciesIds: [],
};

function mergeWithDefaults(defaults: BoatData, overrides?: Partial<BoatData>): BoatData {
  if (!overrides) return { ...defaults };
  const result = { ...defaults };
  for (const key of Object.keys(overrides) as (keyof BoatData)[]) {
    const val = overrides[key];
    if (val !== null && val !== undefined) {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

export function AdminBoatForm({ initialData, onSave, saving }: {
  initialData?: Partial<BoatData>;
  onSave: (data: BoatData) => void;
  saving: boolean;
}) {
  const [data, setData] = useState<BoatData>(mergeWithDefaults(emptyBoat, initialData));
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [newIncluded, setNewIncluded] = useState("");
  const [newExtra, setNewExtra] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/trip-types").then((r) => r.json()),
      fetch("/api/admin/amenities").then((r) => r.json()),
    ]).then(([tt, am]) => {
      setTripTypes(tt);
      setAmenitiesList(am);
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setData(mergeWithDefaults(emptyBoat, initialData));
    }
  }, [initialData]);

  function set(field: string, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function addArrayItem(field: keyof BoatData, value: string, setter: (v: string) => void) {
    if (value.trim()) {
      setData((prev) => ({ ...prev, [field]: [...(prev[field] as string[]), value.trim()] }));
      setter("");
    }
  }

  function removeArrayItem(field: keyof BoatData, index: number) {
    setData((prev) => ({ ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== index) }));
  }

  function toggleCheckbox(field: "tripTypeIds" | "amenityIds" | "speciesIds", id: number) {
    setData((prev) => {
      const arr = prev[field] as number[];
      return { ...prev, [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Status Bar */}
      <section className={`rounded-xl border-2 p-4 flex flex-wrap items-center justify-between gap-4 ${data.isPublished ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => set("isPublished", !data.isPublished)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${data.isPublished ? "bg-green-600" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${data.isPublished ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <div>
            <span className={`text-sm font-semibold ${data.isPublished ? "text-green-800" : "text-amber-800"}`}>
              {data.isPublished ? "Published" : "Unpublished"}
            </span>
            <p className={`text-xs ${data.isPublished ? "text-green-600" : "text-amber-600"}`}>
              {data.isPublished ? "This listing is live and visible to the public" : "This listing is hidden from the public"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${data.isFeaturedAdmin ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600"}`}>
            <input type="checkbox" checked={data.isFeaturedAdmin} onChange={(e) => set("isFeaturedAdmin", e.target.checked)} className="sr-only" />
            {data.isFeaturedAdmin ? "Featured" : "Not Featured"}
          </label>
          {data.slug && (
            <a
              href={`/boats/${data.slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </a>
          )}
        </div>
      </section>

      {/* Basic Info */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boat Name *</label>
            <input value={data.name} onChange={(e) => set("name", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input value={data.slug} onChange={(e) => set("slug", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operator Name *</label>
          <input value={data.operatorName} onChange={(e) => set("operatorName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input value={data.descriptionShort} onChange={(e) => set("descriptionShort", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Long Description *</label>
          <textarea value={data.descriptionLong} onChange={(e) => set("descriptionLong", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} required />
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State Code *</label>
            <input value={data.stateCode} onChange={(e) => set("stateCode", e.target.value.toUpperCase())} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="FL" maxLength={2} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input value={data.cityName} onChange={(e) => set("cityName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port Name</label>
            <input value={data.portName} onChange={(e) => set("portName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input value={data.streetAddress} onChange={(e) => set("streetAddress", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input value={data.zipCode} onChange={(e) => set("zipCode", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="text" value={data.latitude} onChange={(e) => set("latitude", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="text" value={data.longitude} onChange={(e) => set("longitude", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Pricing & Capacity */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pricing & Capacity</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price/Person *</label>
            <input type="text" value={data.minPricePerPerson} onChange={(e) => set("minPricePerPerson", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price/Person *</label>
            <input type="text" value={data.maxPricePerPerson} onChange={(e) => set("maxPricePerPerson", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
            <input type="number" value={data.capacity} onChange={(e) => set("capacity", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
        </div>
      </section>

      {/* Contact & Links */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Contact & Links</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input value={data.phone} onChange={(e) => set("phone", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
            <input type="url" value={data.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking URL</label>
            <input type="url" value={data.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Link Target</label>
            <select value={data.bookingLinkTarget} onChange={(e) => set("bookingLinkTarget", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="_modal">Modal</option>
              <option value="_blank">New Tab</option>
              <option value="_self">Same Tab</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Button Text</label>
            <input value={data.bookingButtonText} onChange={(e) => set("bookingButtonText", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Social Media</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input value={data.socialFacebook} onChange={(e) => set("socialFacebook", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input value={data.socialInstagram} onChange={(e) => set("socialInstagram", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X (Twitter)</label>
            <input value={data.socialX} onChange={(e) => set("socialX", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
            <input value={data.socialYoutube} onChange={(e) => set("socialYoutube", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Images */}
      <ImageManager
        primaryImageUrl={data.primaryImageUrl}
        imageFocalPointX={data.imageFocalPointX}
        imageFocalPointY={data.imageFocalPointY}
        galleryImageUrls={data.galleryImageUrls}
        onPrimaryImageChange={(url) => set("primaryImageUrl", url)}
        onFocalPointChange={(x, y) => { set("imageFocalPointX", x); set("imageFocalPointY", y); }}
        onGalleryChange={(urls) => set("galleryImageUrls", urls)}
      />

      {/* Trip Types & Amenities */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Trip Types & Amenities</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip Types</label>
          <div className="flex flex-wrap gap-2">
            {tripTypes.map((tt) => (
              <label key={tt.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${data.tripTypeIds.includes(tt.id) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200"}`}>
                <input type="checkbox" checked={data.tripTypeIds.includes(tt.id)} onChange={() => toggleCheckbox("tripTypeIds", tt.id)} className="sr-only" />
                {tt.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((am) => (
              <label key={am.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${data.amenityIds.includes(am.id) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200"}`}>
                <input type="checkbox" checked={data.amenityIds.includes(am.id)} onChange={() => toggleCheckbox("amenityIds", am.id)} className="sr-only" />
                {am.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Fishing Details */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Fishing Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Species</label>
          <SpeciesSelect
            selectedIds={data.speciesIds}
            onChange={(ids) => set("speciesIds", ids)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What{"'"}s Included</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.whatsIncluded.map((s, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                {s} <button type="button" onClick={() => removeArrayItem("whatsIncluded", i)} className="text-green-500 hover:text-green-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newIncluded} onChange={(e) => setNewIncluded(e.target.value)} placeholder="Add item..." className="flex-1 border rounded-lg px-3 py-2 text-sm" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArrayItem("whatsIncluded", newIncluded, setNewIncluded); }}} />
            <button type="button" onClick={() => addArrayItem("whatsIncluded", newIncluded, setNewIncluded)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Extras</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.availableExtras.map((s, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                {s} <button type="button" onClick={() => removeArrayItem("availableExtras", i)} className="text-purple-500 hover:text-purple-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newExtra} onChange={(e) => setNewExtra(e.target.value)} placeholder="Add extra..." className="flex-1 border rounded-lg px-3 py-2 text-sm" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArrayItem("availableExtras", newExtra, setNewExtra); }}} />
            <button type="button" onClick={() => addArrayItem("availableExtras", newExtra, setNewExtra)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">SEO</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
          <input value={data.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
          <textarea value={data.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>
      </section>

      <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Boat"}
      </button>
    </form>
  );
}
