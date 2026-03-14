"use client";

import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, XCircle, Loader2, Clock, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  review: {
    id: number;
    boatId: number;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    comment: string;
    tripDate: string | null;
    status: string;
    operatorReply: string | null;
    operatorReplyAt: string | null;
    createdAt: string;
  };
  boatName: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: number, action: "approve" | "reject") {
    if (!confirm(`${action === "approve" ? "Approve" : "Reject"} this review?`)) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      });
      if (!res.ok) {
        toast.error("Action failed");
        return;
      }
      setReviews((prev) =>
        prev.map((r) =>
          r.review.id === id ? { ...r, review: { ...r.review, status: action === "approve" ? "approved" : "rejected" } } : r
        )
      );
      toast.success(`Review ${action === "approve" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this review permanently? This cannot be undone.")) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.review.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setActing(null);
    }
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.review.status === filter);
  const pendingCount = reviews.filter((r) => r.review.status === "pending").length;

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
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-bold">
          Reviews
          {pendingCount > 0 && (
            <span className="ml-2 text-sm font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </h1>
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter === "all" ? "" : filter + " "}reviews found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-xl border">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Boat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reviewer</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Rating</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Review</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(({ review, boatName }) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{boatName}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{review.userName}</div>
                    <div className="text-xs text-gray-400">{review.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                      <Star className="h-3.5 w-3.5 fill-yellow-400" />
                      {review.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{review.title}</div>
                    <div className="text-gray-500 text-xs line-clamp-2">{review.comment}</div>
                    {review.operatorReply && (
                      <div className="mt-1 text-xs text-blue-600 italic truncate">Reply: {review.operatorReply}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={review.status} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(review.id, "approve")}
                            disabled={acting === review.id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Approve"
                          >
                            {acting === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleAction(review.id, "reject")}
                            disabled={acting === review.id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={acting === review.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    default:
      return <span className="text-xs text-gray-500">{status}</span>;
  }
}
