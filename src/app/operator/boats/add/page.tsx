"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BoatForm, type BoatFormData } from "@/components/operator/boat-form";

export default function AddBoatPage() {
  const router = useRouter();

  async function handleSubmit(data: BoatFormData) {
    const res = await fetch("/api/operator/boats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error || "Failed to submit boat");
      return;
    }

    toast.success("Boat submitted for review!");
    router.push("/operator/dashboard");
  }

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
          <h1 className="text-2xl font-display font-bold">List New Boat</h1>
          <p className="text-sm text-muted-foreground">
            Submit your boat for review. Our team will approve it within 24 hours.
          </p>
        </div>
      </div>

      <BoatForm onSubmit={handleSubmit} submitLabel="Submit for Review" />
    </div>
  );
}
