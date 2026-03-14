"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { SelectReview } from "@/lib/db/schema";

interface ReviewSectionProps {
  boatId: number;
  boatSlug: string;
  reviews: SelectReview[];
  averageRating: number;
  reviewCount: number;
  operatorName?: string;
}

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-amber-400" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export function ReviewSection({
  boatId,
  boatSlug,
  reviews,
  averageRating,
  reviewCount,
  operatorName,
}: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    rating: 0,
    title: "",
    comment: "",
    tripDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/boats/${boatSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, boatId }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      toast.success("Review submitted! It will appear after approval.");
      setShowForm(false);
      setFormData({ userName: "", userEmail: "", rating: 0, title: "", comment: "", tripDate: "" });
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews">
      {/* Rating Summary */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {averageRating > 0 ? averageRating.toFixed(1) : "-"}
            </div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-muted-foreground mt-1">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex-1">
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
            >
              {showForm ? "Cancel" : "Write a Review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    required
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rating</label>
                <StarRating
                  rating={formData.rating}
                  onRate={(r) => setFormData({ ...formData, rating: r })}
                  interactive
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Summary of your experience"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Your Review</label>
                <Textarea
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Tell us about your trip..."
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1 block">Trip Date (optional)</label>
                <Input
                  type="date"
                  value={formData.tripDate}
                  onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h4 className="font-medium mb-1">{review.title}</h4>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                {review.operatorReply && (
                  <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                    <p className="text-xs font-semibold text-primary mb-1">
                      Response from {operatorName || "the Captain"}
                    </p>
                    <p className="text-sm text-foreground">{review.operatorReply}</p>
                    {review.operatorReplyAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.operatorReplyAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      )}
    </section>
  );
}
