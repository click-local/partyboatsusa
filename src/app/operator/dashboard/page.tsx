"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatImageUrl } from "@/lib/utils";
import {
  Ship,
  FileText,
  Camera,
  Flag,
  Plus,
  ArrowUpCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Operator {
  id: number;
  email: string;
  companyName: string;
  contactName: string;
  tier: { name: string; badgeColor: string | null; isHighestTier: boolean } | null;
}

interface Boat {
  id: number;
  name: string;
  slug: string;
  cityName: string;
  stateCode: string;
  isPublished: boolean;
}

interface Submission {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

interface PendingPhoto {
  photo: { id: number; photoUrl: string; catchDescription: string; submitterName: string };
  boatName: string;
}

interface ClaimRequest {
  claim: { id: number; status: string; createdAt: string };
  boatName: string;
}

export default function OperatorDashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(() => {
    return Promise.all([
      fetch("/api/operator/profile").then((r) => r.json()),
      fetch("/api/operator/boats").then((r) => r.json()),
      fetch("/api/operator/submissions").then((r) => r.json()),
      fetch("/api/operator/brag-board").then((r) => r.json()),
      fetch("/api/operator/claims").then((r) => r.json()),
    ])
      .then(([profile, boatList, subs, photoList, claimList]) => {
        setOperator(profile);
        setBoats(boatList);
        setSubmissions(subs);
        setPhotos(photoList);
        setClaims(claimList);
      })
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-submit claim request if claimBoatId is in URL
  useEffect(() => {
    const claimBoatId = searchParams.get("claimBoatId");
    if (!claimBoatId || loading) return;

    const boatId = parseInt(claimBoatId, 10);
    if (isNaN(boatId)) return;

    // Clear the URL param immediately to prevent duplicate submissions
    router.replace("/operator/dashboard", { scroll: false });

    fetch("/api/operator/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boatId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success("Claim request submitted! We'll review it shortly.");
          // Refresh claims list
          fetch("/api/operator/claims")
            .then((r) => r.json())
            .then((claimList) => setClaims(claimList));
        }
      })
      .catch(() => toast.error("Failed to submit claim request"));
  }, [searchParams, loading, router]);

  async function handlePhotoAction(photoId: number, action: "approve" | "reject") {
    const method = action === "approve" ? "POST" : "DELETE";
    const res = await fetch(`/api/operator/brag-board/${photoId}`, { method });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.photo.id !== photoId));
      toast.success(`Photo ${action === "approve" ? "approved" : "rejected"}`);
    } else {
      toast.error("Action failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {operator?.contactName}
          </p>
        </div>
        {operator?.tier && !operator.tier.isHighestTier && (
          <Link
            href="/operator/upgrade"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade Plan
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Ship}
          label="Active Boats"
          value={boats.length}
        />
        <StatCard
          icon={FileText}
          label="Pending Submissions"
          value={submissions.filter((s) => s.status === "pending").length}
        />
        <StatCard
          icon={Camera}
          label="Photos to Review"
          value={photos.length}
        />
        <StatCard
          icon={Flag}
          label="Claim Requests"
          value={claims.filter((c) => c.claim.status === "pending").length}
        />
      </div>

      {/* Tier badge */}
      {operator?.tier && (
        <div
          className="rounded-lg p-4 flex items-center justify-between"
          style={{ backgroundColor: (operator.tier.badgeColor || "#004685") + "15" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: operator.tier.badgeColor || "#004685" }}
            >
              {operator.tier.name}
            </span>
            <span className="text-sm text-muted-foreground">Current Plan</span>
          </div>
          <Link
            href="/operator/upgrade"
            className="text-sm text-primary hover:underline"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* My Boats */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold">My Boats</h2>
          <Link
            href="/operator/boats/add"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            List New Boat
          </Link>
        </div>
        {boats.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No boats listed yet</p>
            <Link
              href="/operator/boats/add"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              List Your First Boat
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border divide-y divide-border">
            {boats.map((boat) => (
              <div key={boat.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{boat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {boat.cityName}, {boat.stateCode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      boat.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {boat.isPublished ? "Published" : "Draft"}
                  </span>
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
      </section>

      {/* Pending Submissions */}
      {submissions.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-semibold mb-4">Submissions</h2>
          <div className="bg-white rounded-lg border border-border divide-y divide-border">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={sub.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Photos */}
      {photos.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-semibold mb-4">
            Photos to Review
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(({ photo, boatName }) => (
              <div
                key={photo.id}
                className="bg-white rounded-lg border border-border overflow-hidden"
              >
                <img
                  src={formatImageUrl(photo.photoUrl)}
                  alt={photo.catchDescription}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium">{photo.catchDescription}</p>
                  <p className="text-xs text-muted-foreground">
                    by {photo.submitterName} &middot; {boatName}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handlePhotoAction(photo.id, "approve")}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 text-white rounded-lg py-1.5 text-sm hover:bg-green-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handlePhotoAction(photo.id, "reject")}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-red-600 text-white rounded-lg py-1.5 text-sm hover:bg-red-700"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Claim Requests */}
      {claims.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-semibold mb-4">
            Claim Requests
          </h2>
          <div className="bg-white rounded-lg border border-border divide-y divide-border">
            {claims.map(({ claim, boatName }) => (
              <div key={claim.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{boatName}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };
  const Icon = icons[status] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
