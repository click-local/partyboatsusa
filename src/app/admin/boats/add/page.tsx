"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ship, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AdminBoatForm, type BoatData } from "@/components/admin/boat-form";

export default function AdminAddBoatPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSave(data: BoatData) {
    setSaving(true);
    try {
      const { tripTypeIds, amenityIds, ...boatData } = data;
      const res = await fetch("/api/admin/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...boatData, tripTypeIds, amenityIds }),
      });
      if (res.ok) {
        toast.success("Boat created");
        router.push("/admin/boats");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create boat");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/boats" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Ship className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Add Boat</h1>
      </div>
      <AdminBoatForm onSave={handleSave} saving={saving} />
    </div>
  );
}
