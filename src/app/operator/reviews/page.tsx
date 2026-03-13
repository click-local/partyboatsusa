"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, MessageSquare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import type { SelectReview } from "@/lib/db/schema";

interface ReviewsData {
  reviews: SelectReview[];
  boats: { id: number; name: string }[];
  isPro: boolean;
}

export default function OperatorReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/operator/reviews")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  async function handleReply(reviewId: number) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/operator/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit reply");
      }
      toast.success("Reply posted successfully!");
      // Update local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r) =>
                r.id === reviewId
                  ? { ...r, operatorReply: replyText, operatorReplyAt: new Date() }
                  : r
              ),
            }
          : prev
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.isPro) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-gray-50 border rounded-xl p-8 text-center space-y-4">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-display font-bold">Pro Feature</h1>
          <p className="text-muted-foreground">
            Responding to reviews is available for Pro operators. Upgrade to start engaging with your customers.
          </p>
          <Link href="/operator/upgrade">
            <Button>Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  const boatMap = new Map(data.boats.map((b) => [b.id, b.name]));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Customer Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and respond to reviews on your boats
        </p>
      </div>

      {data.reviews.length === 0 ? (
        <div className="bg-gray-50 border rounded-xl p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet. They will appear here once customers leave feedback.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {boatMap.get(review.boatId) || "Unknown Boat"}
                  </p>
                  <p className="font-semibold">{review.userName}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm">{review.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
              </div>

              {/* Existing reply */}
              {review.operatorReply ? (
                <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Your Reply</p>
                  <p className="text-sm">{review.operatorReply}</p>
                  {review.operatorReplyAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.operatorReplyAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : replyingTo === review.id ? (
                <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    maxLength={2000}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(review.id)}
                      disabled={submitting || !replyText.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Post Reply"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setReplyingTo(review.id);
                    setReplyText("");
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
