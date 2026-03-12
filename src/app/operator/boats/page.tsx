"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ship, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Boat {
  id: number;
  name: string;
  slug: string;
  cityName: string;
  stateCode: string;
  isPublished: boolean;
  primaryImageUrl: string | null;
}

export default function OperatorBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operator/boats")
      .then((r) => r.json())
      .then(setBoats)
      .catch(() => toast.error("Failed to load boats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">My Boats</h1>
        <Link
          href="/operator/boats/add"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          List New Boat
        </Link>
      </div>

      {boats.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No boats listed yet</h2>
          <p className="text-muted-foreground mb-6">
            Get started by listing your first boat on Party Boats USA.
          </p>
          <Link
            href="/operator/boats/add"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            List Your First Boat
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {boats.map((boat) => (
            <div
              key={boat.id}
              className="bg-white rounded-lg border border-border p-4 flex items-center gap-4"
            >
              <div className="w-20 h-14 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                {boat.primaryImageUrl ? (
                  <img
                    src={boat.primaryImageUrl}
                    alt={boat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ship className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{boat.name}</p>
                <p className="text-sm text-muted-foreground">
                  {boat.cityName}, {boat.stateCode}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                  boat.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {boat.isPublished ? "Published" : "Draft"}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/operator/boats/edit/${boat.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </Link>
                <Link
                  href={`/boats/${boat.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
