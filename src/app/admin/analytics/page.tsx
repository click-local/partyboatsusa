"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Ship, Users, FileText, Star, Image, MapPin, Map } from "lucide-react";
import { toast } from "sonner";

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
        // Count distinct states and cities from actual boats
        const distinctStates = new Set(boatList.map((b: Record<string, unknown>) => b.stateCode)).size;
        const distinctCities = new Set(boatList.map((b: Record<string, unknown>) => `${b.cityName}|${b.stateCode}`)).size;
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
    { label: "Operators", value: stats.operators, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "States", value: stats.states, sub: "with boats listed", icon: Map, color: "text-teal-600 bg-teal-50" },
    { label: "Cities", value: stats.cities, sub: "with boats listed", icon: MapPin, color: "text-orange-600 bg-orange-50" },
    { label: "Reviews", value: stats.reviews, sub: stats.pendingReviews > 0 ? `${stats.pendingReviews} pending` : undefined, icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "Brag Board", value: stats.bragPhotos, sub: stats.pendingPhotos > 0 ? `${stats.pendingPhotos} pending` : undefined, icon: Image, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

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
  );
}
