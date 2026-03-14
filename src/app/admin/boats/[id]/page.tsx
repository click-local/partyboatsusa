"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ship, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AdminBoatForm, type BoatData } from "@/components/admin/boat-form";

export default function AdminEditBoatPage() {
  const params = useParams();
  const router = useRouter();
  const [boat, setBoat] = useState<Record<string, unknown> | null>(null);
  const [boatTripTypeIds, setBoatTripTypeIds] = useState<number[]>([]);
  const [boatAmenityIds, setBoatAmenityIds] = useState<number[]>([]);
  const [boatSpeciesIds, setBoatSpeciesIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [boatRes, ttRes, amRes, spRes] = await Promise.all([
          fetch(`/api/admin/boats/${params.id}`).then((r) => r.json()),
          fetch(`/api/admin/boats/${params.id}/trip-types`).then((r) => r.json()).catch(() => []),
          fetch(`/api/admin/boats/${params.id}/amenities`).then((r) => r.json()).catch(() => []),
          fetch(`/api/admin/boats/${params.id}/species`).then((r) => r.json()).catch(() => []),
        ]);
        setBoat(boatRes);
        setBoatTripTypeIds(Array.isArray(ttRes) ? ttRes.map((t: { tripTypeId: number }) => t.tripTypeId) : []);
        setBoatAmenityIds(Array.isArray(amRes) ? amRes.map((a: { amenityId: number }) => a.amenityId) : []);
        setBoatSpeciesIds(Array.isArray(spRes) ? spRes.map((s: { speciesId: number }) => s.speciesId) : []);
      } catch {
        toast.error("Failed to load boat");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSave(data: BoatData) {
    setSaving(true);
    try {
      const { tripTypeIds, amenityIds, speciesIds, ...boatData } = data;
      const res = await fetch(`/api/admin/boats/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...boatData, tripTypeIds, amenityIds, speciesIds }),
      });
      if (res.ok) {
        toast.success("Boat updated");
        router.push("/admin/boats");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update boat");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Boat not found.</p>
        <Link href="/admin/boats" className="text-blue-600 hover:underline text-sm">Back to Boats</Link>
      </div>
    );
  }

  const initialData = {
    ...boat,
    galleryImageUrls: Array.isArray(boat.galleryImageUrls) ? boat.galleryImageUrls : [],
    targetSpecies: Array.isArray(boat.targetSpecies) ? boat.targetSpecies : [],
    whatsIncluded: Array.isArray(boat.whatsIncluded) ? boat.whatsIncluded : [],
    availableExtras: Array.isArray(boat.availableExtras) ? boat.availableExtras : [],
    tripTypeIds: boatTripTypeIds,
    amenityIds: boatAmenityIds,
    speciesIds: boatSpeciesIds,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/boats" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Ship className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Edit: {boat.name as string}</h1>
      </div>
      <AdminBoatForm initialData={initialData} onSave={handleSave} saving={saving} />
    </div>
  );
}
