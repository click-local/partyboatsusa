"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Ship,
  Star,
  Camera,
  Plus,
  ArrowUpCircle,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
  ExternalLink,
  Pencil,
  Anchor,
} from "lucide-react";
import { toast } from "sonner";
import { formatImageUrl } from "@/lib/utils";

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
  rating: string | null;
  reviewCount: number | null;
  primaryImageUrl: string | null;
}

interface Review {
  id: number;
  boatId: number;
  boatName: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  operatorReply: string | null;
}

interface PendingPhoto {
  photo: {
    id: number;
    photoUrl: string;
    catchDescription: string;
    submitterName: string;
  };
  boatName: string;
}

interface DashboardData {
  operator: Operator;
  boats: Boat[];
  recentReviews: Review[];
  pendingPhotos: PendingPhoto[];
  stats: {
    totalReviews: number;
    averageRating: number;
    approvedPhotoCount: number;
    pendingPhotoCount: number;
  };
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
  const claimBoatId = searchParams.get("claimBoatId");
  const claimSubmitted = useRef(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    return fetch("/api/operator/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-submit claim request when arriving from claim flow
  useEffect(() => {
    if (!claimBoatId || claimSubmitted.current) return;
    claimSubmitted.current = true;

    fetch("/api/operator/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boatId: parseInt(claimBoatId, 10) }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            "Claim request submitted! Our team will review it within 24 hours."
          );
        }
      })
      .catch(() => toast.error("Failed to submit claim request"));

    // Clean up the URL
    window.history.replaceState({}, "", "/operator/dashboard");
  }, [claimBoatId]);

  async function handlePhotoAction(
    photoId: number,
    action: "approve" | "reject"
  ) {
    const method = action === "approve" ? "POST" : "DELETE";
    const res = await fetch(`/api/operator/brag-board/${photoId}`, { method });
    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingPhotos: prev.pendingPhotos.filter(
            (p) => p.photo.id !== photoId
          ),
          stats: {
            ...prev.stats,
            pendingPhotoCount: prev.stats.pendingPhotoCount - 1,
            approvedPhotoCount:
              action === "approve"
                ? prev.stats.approvedPhotoCount + 1
                : prev.stats.approvedPhotoCount,
          },
        };
      });
      toast.success(
        `Photo ${action === "approve" ? "approved" : "rejected"}`
      );
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

  if (!data) return null;

  const { operator, boats, recentReviews, pendingPhotos, stats } = data;
  const isPro = operator.tier?.isHighestTier;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome back, {operator.contactName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {operator.companyName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {operator.tier && (
            <Link
              href="/operator/upgrade"
              className="inline-flex items-center gap-2"
            >
              <span
                className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{
                  backgroundColor: operator.tier.badgeColor || "#004685",
                }}
              >
                {operator.tier.name}
              </span>
            </Link>
          )}
          {operator.tier && !isPro && (
            <Link
              href="/operator/upgrade"
              className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Ship}
          label="Active Boats"
          value={String(boats.length)}
          iconColor="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Reviews"
          value={String(stats.totalReviews)}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={Star}
          label="Avg. Rating"
          value={
            stats.averageRating > 0
              ? stats.averageRating.toFixed(1)
              : "--"
          }
          subtitle={
            stats.averageRating > 0
              ? renderStarString(stats.averageRating)
              : undefined
          }
          iconColor="text-amber-500"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={Camera}
          label="Brag Board Photos"
          value={String(stats.approvedPhotoCount)}
          subtitle={
            stats.pendingPhotoCount > 0
              ? `${stats.pendingPhotoCount} pending`
              : undefined
          }
          iconColor="text-purple-500"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Photos to Review */}
      {pendingPhotos.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-lg font-display font-semibold">
              Photos Awaiting Review
            </h2>
            <span className="text-xs text-muted-foreground bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pendingPhotos.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPhotos.map(({ photo, boatName }) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={formatImageUrl(photo.photoUrl)}
                    alt={photo.catchDescription}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">
                    {photo.catchDescription}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {photo.submitterName} - {boatName}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handlePhotoAction(photo.id, "approve")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handlePhotoAction(photo.id, "reject")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-50 transition-colors"
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

      {/* My Boats */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold">My Boats</h2>
          <Link
            href="/operator/boats/add"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Boat
          </Link>
        </div>
        {boats.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-10 text-center">
            <Ship className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-1">
              No boats listed yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first boat to Party Boats USA.
            </p>
            <Link
              href="/operator/boats/add"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              List Your First Boat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boats.map((boat) => (
              <div
                key={boat.id}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Boat Image */}
                  <div className="relative w-28 sm:w-36 shrink-0 bg-muted">
                    {boat.primaryImageUrl ? (
                      <Image
                        src={formatImageUrl(boat.primaryImageUrl)}
                        alt={boat.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Anchor className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  {/* Boat Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{boat.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {boat.cityName}, {boat.stateCode}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          boat.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {boat.isPublished ? "Live" : "Draft"}
                      </span>
                    </div>
                    {/* Rating + Reviews */}
                    <div className="flex items-center gap-3 mt-2">
                      {Number(boat.rating) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-medium text-foreground">
                            {Number(boat.rating).toFixed(1)}
                          </span>
                          ({boat.reviewCount}{" "}
                          {boat.reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No reviews yet
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        href={`/operator/boats/edit/${boat.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <Link
                        href={`/boats/${boat.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Reviews */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold">
            Recent Reviews
          </h2>
          {stats.totalReviews > 0 && (
            <Link
              href="/operator/reviews"
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </Link>
          )}
        </div>
        {recentReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No reviews yet. Reviews will appear here once customers share
              their experiences.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border divide-y divide-border">
            {recentReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{review.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {review.userName} - {review.boatName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                      {review.comment}
                    </p>
                    {review.operatorReply && (
                      <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-blue-700">
                          Your reply:
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5 line-clamp-2">
                          {review.operatorReply}
                        </p>
                      </div>
                    )}
                  </div>
                  {isPro && !review.operatorReply && (
                    <Link
                      href="/operator/reviews"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Reply
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle?: string;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subtitle && (
            <p className="text-xs text-amber-600 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function renderStarString(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}
