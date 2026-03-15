"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Save, Plus, X, ArrowUpCircle, ChevronUp, ChevronDown, HelpCircle } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { SpeciesSelect } from "@/components/species-select";

interface TripType { id: number; name: string; }
interface Amenity { id: number; name: string; icon: string; }

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
  socialX: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  primaryImageUrl: string;
  galleryImageUrls: string[];
  targetSpecies: string[];
  whatsIncluded: string[];
  availableExtras: string[];
  tripTypeIds: number[];
  amenityIds: number[];
  speciesIds: number[];
  faqs: { id?: number; question: string; answer: string; sortOrder: number }[];
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
  socialX: "",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  primaryImageUrl: "",
  galleryImageUrls: [],
  targetSpecies: [],
  whatsIncluded: [],
  availableExtras: [],
  tripTypeIds: [],
  amenityIds: [],
  speciesIds: [],
  faqs: [],
};

interface BoatFormProps {
  initialData?: Partial<BoatFormData>;
  onSubmit: (data: BoatFormData) => Promise<void>;
  submitLabel?: string;
  isPro?: boolean;
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

export function BoatForm({ initialData, onSubmit, submitLabel = "Submit", isPro = false }: BoatFormProps) {
  const [data, setData] = useState<BoatFormData>({ ...DEFAULT_DATA, ...initialData });
  const [saving, setSaving] = useState(false);
  const [includedInput, setIncludedInput] = useState("");
  const [extrasInput, setExtrasInput] = useState("");
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestCommon, setSuggestCommon] = useState("");
  const [suggestNotes, setSuggestNotes] = useState("");
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/operator/trip-types").then((r) => r.json()),
      fetch("/api/operator/amenities").then((r) => r.json()),
    ]).then(([tt, am]) => {
      setTripTypes(tt);
      setAmenitiesList(am);
    });
  }, []);

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

  function addIncluded() {
    const val = includedInput.trim();
    if (val && !data.whatsIncluded.includes(val)) {
      update("whatsIncluded", [...data.whatsIncluded, val]);
    }
    setIncludedInput("");
  }

  function removeIncluded(s: string) {
    update("whatsIncluded", data.whatsIncluded.filter((x) => x !== s));
  }

  function addExtra() {
    const val = extrasInput.trim();
    if (val && !data.availableExtras.includes(val)) {
      update("availableExtras", [...data.availableExtras, val]);
    }
    setExtrasInput("");
  }

  function removeExtra(s: string) {
    update("availableExtras", data.availableExtras.filter((x) => x !== s));
  }

  async function handleSuggestSubmit() {
    setSuggestSubmitting(true);
    setSuggestError("");
    try {
      const res = await fetch("/api/operator/species-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesName: suggestName.trim(),
          commonNames: suggestCommon.trim() || undefined,
          notes: suggestNotes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      setSuggestSuccess(true);
      setTimeout(() => {
        setSuggestOpen(false);
        setSuggestName("");
        setSuggestCommon("");
        setSuggestNotes("");
        setSuggestSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setSuggestError(err instanceof Error ? err.message : "Failed to submit suggestion");
    } finally {
      setSuggestSubmitting(false);
    }
  }

  function toggleCheckbox(field: "tripTypeIds" | "amenityIds" | "speciesIds", id: number) {
    setData((prev) => {
      const arr = prev[field] as number[];
      return { ...prev, [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  }

  function addFaq() {
    if (data.faqs.length >= 10) return;
    update("faqs", [...data.faqs, { question: "", answer: "", sortOrder: data.faqs.length }]);
  }

  function removeFaq(index: number) {
    const updated = data.faqs.filter((_, i) => i !== index).map((f, i) => ({ ...f, sortOrder: i }));
    update("faqs", updated);
  }

  function updateFaq(index: number, field: "question" | "answer", value: string) {
    const updated = data.faqs.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    update("faqs", updated);
  }

  function moveFaq(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.faqs.length) return;
    const updated = [...data.faqs];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    update("faqs", updated.map((f, i) => ({ ...f, sortOrder: i })));
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
          <label className="block text-sm font-medium mb-1">Primary Image</label>
          <p className="text-sm text-muted-foreground mb-2">Upload a high-quality photo of your boat. This is the main image shown on your listing and in search results.</p>
          <ImageUpload
            value={data.primaryImageUrl}
            onChange={(url) => update("primaryImageUrl", url)}
            onRemove={() => update("primaryImageUrl", "")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gallery Images</label>
          {isPro ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.galleryImageUrls.map((url, i) => (
                <div key={i} className="relative h-32 rounded-lg overflow-hidden border border-border">
                  <Image src={url} alt={`Gallery image ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
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
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                Photo galleries are available on the Pro Captain plan.
              </p>
              <Link
                href="/operator/upgrade"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trip Types & Amenities */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Trip Types & Amenities</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Trip Types</label>
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
          <label className="block text-sm font-medium mb-2">Amenities</label>
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

      {/* Target Species */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Target Species</h2>
        <p className="text-sm text-muted-foreground">Search or browse to select the species your boat targets.</p>
        <SpeciesSelect
          selectedIds={data.speciesIds}
          onChange={(ids) => update("speciesIds", ids)}
          showSuggest
          onSuggest={() => setSuggestOpen(true)}
        />
      </section>

      {/* Species Suggestion Dialog */}
      {suggestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Suggest a Species</h3>
            <p className="text-sm text-gray-500">
              Can&apos;t find a species in our database? Let us know and we&apos;ll review it for addition.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Species Name *</label>
              <input
                type="text"
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Yellowfin Tuna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Common Names</label>
              <input
                type="text"
                value={suggestCommon}
                onChange={(e) => setSuggestCommon(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Ahi, Allison Tuna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={suggestNotes}
                onChange={(e) => setSuggestNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Any additional context..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setSuggestOpen(false); setSuggestName(""); setSuggestCommon(""); setSuggestNotes(""); setSuggestError(""); }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!suggestName.trim() || suggestSubmitting}
                onClick={handleSuggestSubmit}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {suggestSubmitting ? "Submitting..." : "Submit Suggestion"}
              </button>
            </div>
            {suggestSuccess && (
              <p className="text-sm text-green-600">Suggestion submitted! We&apos;ll review it shortly.</p>
            )}
            {suggestError && (
              <p className="text-sm text-red-600">{suggestError}</p>
            )}
          </div>
        </div>
      )}

      {/* What's Included */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">What&apos;s Included</h2>
        <p className="text-sm text-muted-foreground">Add items that are included with a trip (e.g., bait, tackle, rod rental, fish cleaning).</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={includedInput}
            onChange={(e) => setIncludedInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIncluded())}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g., Bait & Tackle"
          />
          <button type="button" onClick={addIncluded}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {data.whatsIncluded.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.whatsIncluded.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                {s}
                <button type="button" onClick={() => removeIncluded(s)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Available Extras */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Available Extras</h2>
        <p className="text-sm text-muted-foreground">Add optional upgrades or extras available for purchase (e.g., private charter, fish cleaning, cooler rental).</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={extrasInput}
            onChange={(e) => setExtrasInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExtra())}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g., Private Charter"
          />
          <button type="button" onClick={addExtra}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {data.availableExtras.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.availableExtras.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                {s}
                <button type="button" onClick={() => removeExtra(s)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* FAQs */}
      <section className="bg-white rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        </div>
        {isPro ? (
          <>
            <p className="text-sm text-muted-foreground">Add up to 10 FAQs to help anglers learn more about your boat and trips. These appear on your public listing with rich snippet support for search engines.</p>
            {data.faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">FAQ {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveFaq(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFaq(index, "down")}
                      disabled={index === data.faqs.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="p-1 rounded hover:bg-red-100 text-red-500"
                      title="Remove FAQ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., What time should I arrive?"
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Answer</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Provide a helpful answer..."
                    maxLength={2000}
                  />
                </div>
              </div>
            ))}
            {data.faqs.length < 10 && (
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
              >
                <Plus className="h-4 w-4" />
                Add FAQ
              </button>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">
              Custom FAQs with rich snippet support are available on the Pro Captain plan.
            </p>
            <Link
              href="/operator/upgrade"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Upgrade to Pro
            </Link>
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
