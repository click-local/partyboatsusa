"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BoatForm, type BoatFormData } from "@/components/operator/boat-form";

export default function EditBoatPage() {
  const router = useRouter();
  const params = useParams();
  const boatId = params.id as string;

  const [boat, setBoat] = useState<Partial<BoatFormData> | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/operator/boats/${boatId}`).then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      }),
      fetch("/api/operator/profile").then((r) => r.json()),
    ])
      .then(([boatData, profile]) => {
        setBoat(boatData);
        setIsPro(profile?.tier?.isHighestTier || false);
      })
      .catch(() => {
        toast.error("Boat not found");
        router.push("/operator/boats");
      })
      .finally(() => setLoading(false));
  }, [boatId, router]);

  async function handleSubmit(data: BoatFormData) {
    const res = await fetch(`/api/operator/boats/${boatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error || "Failed to update boat");
      return;
    }

    toast.success("Boat updated!");
    router.push("/operator/boats");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boat) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/operator/boats"
          className="p-2 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Edit Boat</h1>
          <p className="text-sm text-muted-foreground">
            Update your boat listing information.
          </p>
        </div>
      </div>

      <BoatForm
        initialData={boat}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isPro={isPro}
      />
    </div>
  );
}
