"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Ship, Users, Star, Image, MapPin, Map, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Stats {
  boats: number;
  publishedBoats: number;
  operators: number;
  submissions: number;
  pendingSubmissions: number;
  reviews: number;
  pendingReviews: number;
  bragPhotos: number;
  pendingPhotos: number;
  states: number;
  cities: number;
  destinationPages: number;
  topBoats: { id: number; name: string; slug: string; rating: string; reviewCount: number; cityName: string; stateCode: string }[];
  stateDistribution: { stateCode: string; count: number }[];
  claimedCount: number;
  featuredCount: number;
  avgRating: string;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/boats").then((r) => r.json()),
      fetch("/api/admin/operator-tiers/list").then((r) => r.json()),
      fetch("/api/admin/submissions").then((r) => r.json()),
      fetch("/api/admin/reviews").then((r) => r.json()),
      fetch("/api/admin/destination-pages").then((r) => r.json()),
      fetch("/api/admin/brag-board/counts").then((r) => r.json()),
    ])
      .then(([boats, operators, submissions, reviewsData, destPages, bragCounts]) => {
        const boatList = Array.isArray(boats) ? boats : [];
        const subList = Array.isArray(submissions) ? submissions : [];
        const reviewList = Array.isArray(reviewsData) ? reviewsData : [];
        const distinctStates = new Set(boatList.map((b: Record<string, unknown>) => b.stateCode)).size;
        const distinctCities = new Set(boatList.map((b: Record<string, unknown>) => `${b.cityName}|${b.stateCode}`)).size;

        // Top 10 boats by rating (with reviews)
        const topBoats = [...boatList]
          .filter((b: Record<string, unknown>) => Number(b.reviewCount) > 0)
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const ratingDiff = Number(b.rating) - Number(a.rating);
            if (ratingDiff !== 0) return ratingDiff;
            return Number(b.reviewCount) - Number(a.reviewCount);
          })
          .slice(0, 10)
          .map((b: Record<string, unknown>) => ({
            id: b.id as number,
            name: b.name as string,
            slug: b.slug as string,
            rating: b.rating as string,
            reviewCount: b.reviewCount as number,
            cityName: b.cityName as string,
            stateCode: b.stateCode as string,
          }));

        // State distribution
        const stateCounts: Record<string, number> = {};
        for (const b of boatList) {
          const sc = b.stateCode as string;
          stateCounts[sc] = (stateCounts[sc] || 0) + 1;
        }
        const stateDistribution = Object.entries(stateCounts)
          .map(([stateCode, count]) => ({ stateCode, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        // Additional metrics
        const claimedCount = boatList.filter((b: Record<string, unknown>) => b.operatorId != null).length;
        const featuredCount = boatList.filter((b: Record<string, unknown>) => b.isFeaturedAdmin).length;
        const ratedBoats = boatList.filter((b: Record<string, unknown>) => Number(b.rating) > 0);
        const avgRating = ratedBoats.length > 0
          ? (ratedBoats.reduce((s: number, b: Record<string, unknown>) => s + Number(b.rating), 0) / ratedBoats.length).toFixed(1)
          : "0.0";

        setStats({
          boats: boatList.length,
          publishedBoats: boatList.filter((b: Record<string, unknown>) => b.isPublished).length,
          operators: Array.isArray(operators) ? operators.length : 0,
          submissions: subList.length,
          pendingSubmissions: subList.filter((s: Record<string, unknown>) => s.status === "pending").length,
          reviews: reviewList.length,
          pendingReviews: reviewList.filter((r: Record<string, unknown>) => {
            const review = (r as Record<string, unknown>).review as Record<string, unknown> | undefined;
            return (review?.status ?? r.status) === "pending";
          }).length,
          bragPhotos: bragCounts?.total ?? 0,
          pendingPhotos: bragCounts?.pending ?? 0,
          states: distinctStates,
          cities: distinctCities,
          destinationPages: (destPages?.pages ?? []).length,
          topBoats,
          stateDistribution,
          claimedCount,
          featuredCount,
          avgRating,
        });
      })
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const cards = [
    { label: "Total Boats", value: stats.boats, sub: `${stats.publishedBoats} published`, icon: Ship, color: "text-blue-600 bg-blue-50" },
    { label: "Operators", value: stats.operators, sub: `${stats.claimedCount} claimed listings`, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "States", value: stats.states, sub: "with boats listed", icon: Map, color: "text-teal-600 bg-teal-50" },
    { label: "Cities", value: stats.cities, sub: "with boats listed", icon: MapPin, color: "text-orange-600 bg-orange-50" },
    { label: "Reviews", value: stats.reviews, sub: stats.pendingReviews > 0 ? `${stats.pendingReviews} pending` : `Avg ${stats.avgRating}`, icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "Brag Board", value: stats.bragPhotos, sub: stats.pendingPhotos > 0 ? `${stats.pendingPhotos} pending` : undefined, icon: Image, color: "text-pink-600 bg-pink-50" },
  ];

  const maxStateCount = stats.stateDistribution.length > 0 ? stats.stateDistribution[0].count : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <span className="text-3xl font-bold">{card.value}</span>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Featured Boats</p>
            <p className="text-xl font-bold">{stats.featuredCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-xl font-bold">{stats.avgRating}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Map className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination Pages</p>
            <p className="text-xl font-bold">{stats.destinationPages}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Boats */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Top Rated Boats</h2>
          {stats.topBoats.length > 0 ? (
            <div className="space-y-3">
              {stats.topBoats.map((boat, i) => (
                <div key={boat.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/boats/${boat.id}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                      {boat.name}
                    </Link>
                    <span className="text-xs text-gray-400">{boat.cityName}, {boat.stateCode}</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">
                    ★ {Number(boat.rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">({boat.reviewCount})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No rated boats yet.</p>
          )}
        </div>

        {/* Boats by State */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Boats by State (Top 15)</h2>
          {stats.stateDistribution.length > 0 ? (
            <div className="space-y-2">
              {stats.stateDistribution.map((item) => (
                <div key={item.stateCode} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-8">{item.stateCode}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((item.count / maxStateCount) * 100, 8)}%` }}
                    >
                      <span className="text-[10px] text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No boats yet.</p>
          )}
        </div>
      </div>

      {/* External Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Google Analytics</h2>
          <p className="text-sm text-gray-600">
            Google Analytics 4 is active with measurement ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">G-KNV3F1N4ZL</code>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            View detailed traffic analytics in your{" "}
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Google Analytics dashboard
            </a>.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Microsoft Clarity</h2>
          <p className="text-sm text-gray-600">
            Microsoft Clarity is active for heatmaps and session recordings.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            View session recordings in your{" "}
            <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Clarity dashboard
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
