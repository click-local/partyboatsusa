"use client";

import { useState } from "react";
import { Loader2, Save, Plus, X } from "lucide-react";
import { ImageUpload } from "./image-upload";

export interface BoatFormData {
  name: string;
  operatorName: string;
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
  bookingButtonText: string;
  socialX: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  primaryImageUrl: string;
  galleryImageUrls: string[];
  targetSpecies: string[];
  tripTypeIds: number[];
  amenityIds: number[];
}

const DEFAULT_DATA: BoatFormData = {
  name: "",
  operatorName: "",
  descriptionShort: "",
  descriptionLong: "",
  stateCode: "",
  cityName: "",
  portName: "",
  streetAddress: "",
  zipCode: "",
  latitude: "",
  longitude: "",
  minPricePerPerson: "",
  maxPricePerPerson: "",
  capacity: 0,
  phone: "",
  email: "",
  websiteUrl: "",
  bookingUrl: "",
  bookingButtonText: "Book Now",
  socialX: "",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  primaryImageUrl: "",
  galleryImageUrls: [],
  targetSpecies: [],
  tripTypeIds: [],
  amenityIds: [],
};

interface BoatFormProps {
  initialData?: Partial<BoatFormData>;
  onSubmit: (data: BoatFormData) => Promise<void>;
  submitLabel?: string;
}

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

export function BoatForm({ initialData, onSubmit, submitLabel = "Submit" }: BoatFormProps) {
  const [data, setData] = useState<BoatFormData>({ ...DEFAULT_DATA, ...initialData });
  const [saving, setSaving] = useState(false);
  const [speciesInput, setSpeciesInput] = useState("");

  function update<K extends keyof BoatFormData>(key: K, value: BoatFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  }

  function addSpecies() {
    const val = speciesInput.trim();
    if (val && !data.targetSpecies.includes(val)) {
      update("targetSpecies", [...data.targetSpecies, val]);
    }
    setSpeciesInput("");
  }

  function removeSpecies(s: string) {
    update("targetSpecies", data.targetSpecies.filter((x) => x !== s));
  }

  function addGalleryImage(url: string) {
    update("galleryImageUrls", [...data.galleryImageUrls, url]);
  }

  function removeGalleryImage(index: number) {
    update("galleryImageUrls", data.galleryImageUrls.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Boat Name" required>
            <input type="text" required value={data.name} onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., The Sea Queen" />
          </Field>
          <Field label="Operator Name" required>
            <input type="text" required value={data.operatorName} onChange={(e) => update("operatorName", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your charter company name" />
          </Field>
        </div>
        <Field label="Short Description">
          <input type="text" value={data.descriptionShort} onChange={(e) => update("descriptionShort", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Brief one-liner about your boat" />
        </Field>
        <Field label="Full Description" required>
          <textarea required rows={5} value={data.descriptionLong} onChange={(e) => update("descriptionLong", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Detailed description of your boat, trips, and experience" />
        </Field>
      </section>

      {/* Location */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="State" required>
            <select required value={data.stateCode} onChange={(e) => update("stateCode", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Select a state</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="City" required>
            <input type="text" required value={data.cityName} onChange={(e) => update("cityName", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="Port / Marina Name">
            <input type="text" value={data.portName} onChange={(e) => update("portName", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="Street Address">
            <input type="text" value={data.streetAddress} onChange={(e) => update("streetAddress", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="Zip Code">
            <input type="text" value={data.zipCode} onChange={(e) => update("zipCode", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
        </div>
      </section>

      {/* Pricing & Capacity */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pricing & Capacity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Min Price Per Person" required>
            <input type="number" step="0.01" required value={data.minPricePerPerson}
              onChange={(e) => update("minPricePerPerson", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="25.00" />
          </Field>
          <Field label="Max Price Per Person" required>
            <input type="number" step="0.01" required value={data.maxPricePerPerson}
              onChange={(e) => update("maxPricePerPerson", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="75.00" />
          </Field>
          <Field label="Passenger Capacity" required>
            <input type="number" required min={1} value={data.capacity || ""}
              onChange={(e) => update("capacity", parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="50" />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone" required>
            <input type="tel" required value={data.phone} onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="(555) 123-4567" />
          </Field>
          <Field label="Email">
            <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="Website URL" required>
            <input type="url" required value={data.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://yourcharter.com" />
          </Field>
          <Field label="Booking URL">
            <input type="url" value={data.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://yourcharter.com/book" />
          </Field>
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Facebook">
            <input type="url" value={data.socialFacebook} onChange={(e) => update("socialFacebook", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://facebook.com/yourcharter" />
          </Field>
          <Field label="Instagram">
            <input type="url" value={data.socialInstagram} onChange={(e) => update("socialInstagram", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://instagram.com/yourcharter" />
          </Field>
          <Field label="X (Twitter)">
            <input type="url" value={data.socialX} onChange={(e) => update("socialX", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
          <Field label="YouTube">
            <input type="url" value={data.socialYoutube} onChange={(e) => update("socialYoutube", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </Field>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Primary Image</label>
          <ImageUpload
            value={data.primaryImageUrl}
            onChange={(url) => update("primaryImageUrl", url)}
            onRemove={() => update("primaryImageUrl", "")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gallery Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.galleryImageUrls.map((url, i) => (
              <div key={i} className="relative h-32 rounded-lg overflow-hidden border border-border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <ImageUpload
              onChange={addGalleryImage}
              label="Add Photo"
            />
          </div>
        </div>
      </section>

      {/* Target Species */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Target Species</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={speciesInput}
            onChange={(e) => setSpeciesInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecies())}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g., Red Snapper"
          />
          <button type="button" onClick={addSpecies}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {data.targetSpecies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.targetSpecies.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {s}
                <button type="button" onClick={() => removeSpecies(s)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
