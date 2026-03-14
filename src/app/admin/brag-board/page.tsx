"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  id: number;
  boatId: number;
  boatName: string;
  boatSlug: string;
  submitterName: string;
  submitterEmail: string | null;
  photoUrl: string;
  catchDescription: string;
  status: string;
  submittedAt: string;
}

export default function AdminBragBoardPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/brag-board/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => toast.error("Failed to load photos"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(photo: Photo, action: "approve" | "reject") {
    setActing(photo.id);

    try {
      const res = await fetch("/api/admin/brag-board/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          action,
          boatId: photo.boatId,
          boatName: photo.boatName,
          boatSlug: photo.boatSlug,
          submitterName: photo.submitterName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Action failed");
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p
        )
      );
      toast.success(`Photo ${action === "approve" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActing(null);
    }
  }

  const filtered = filter === "all" ? photos : photos.filter((p) => p.status === filter);
  const pendingCount = photos.filter((p) => p.status === "pending").length;

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
          <Camera className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">
            Brag Board Photos
            {pendingCount > 0 && (
              <span className="ml-2 text-sm font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter === "all" ? "" : filter + " "}photos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={photo.photoUrl}
                  alt={photo.catchDescription}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {photo.boatName}
                  </p>
                  <StatusBadge status={photo.status} />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {photo.catchDescription}
                </p>
                <div className="text-xs text-gray-500">
                  <p>By: {photo.submitterName}</p>
                  <p>{new Date(photo.submittedAt).toLocaleDateString()}</p>
                </div>
                {photo.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAction(photo, "approve")}
                      disabled={acting === photo.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === photo.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(photo, "reject")}
                      disabled={acting === photo.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return <span className="text-xs text-gray-500">{status}</span>;
  }
}
