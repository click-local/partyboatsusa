"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BoatOption {
  id: number;
  name: string;
  cityName: string;
  stateCode: string;
}

interface BragBoardFormProps {
  boats: BoatOption[];
  preselectedBoatId?: number;
}

export function BragBoardForm({ boats, preselectedBoatId }: BragBoardFormProps) {
  const [formLoadedAt] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [boatSearch, setBoatSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    boatId: preselectedBoatId ? String(preselectedBoatId) : "",
    submitterName: "",
    submitterEmail: "",
    catchDescription: "",
    honeypot: "",
  });

  const filteredBoats = boatSearch
    ? boats.filter(
        (b) =>
          b.name.toLowerCase().includes(boatSearch.toLowerCase()) ||
          b.cityName.toLowerCase().includes(boatSearch.toLowerCase())
      )
    : boats;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    // Show preview immediately
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload/public", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPhotoUrl(data.url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setPhotoPreview("");
      setPhotoUrl("");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoUrl) {
      toast.error("Please upload a photo");
      return;
    }
    if (!formData.boatId) {
      toast.error("Please select a boat");
      return;
    }
    if (!formData.submitterName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.catchDescription.trim()) {
      toast.error("Please describe your catch");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/brag-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boatId: Number(formData.boatId),
          submitterName: formData.submitterName.trim(),
          submitterEmail: formData.submitterEmail.trim() || null,
          catchDescription: formData.catchDescription.trim(),
          photoUrl,
          honeypot: formData.honeypot,
          formLoadedAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
      toast.success("Photo submitted! It will appear after approval.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border rounded-xl p-8 text-center space-y-3">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-xl font-display font-bold">Photo Submitted!</h3>
        <p className="text-muted-foreground text-sm">
          Your catch photo has been submitted for review. It will appear on the
          brag board once approved.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setPhotoUrl("");
            setPhotoPreview("");
            setFormData({
              boatId: preselectedBoatId ? String(preselectedBoatId) : "",
              submitterName: "",
              submitterEmail: "",
              catchDescription: "",
              honeypot: "",
            });
          }}
        >
          Submit Another Photo
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-5">
      <div>
        <h3 className="text-xl font-display font-bold">Submit Your Catch</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Share your best party boat fishing photo with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.honeypot}
            onChange={(e) =>
              setFormData({ ...formData, honeypot: e.target.value })
            }
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Catch Photo <span className="text-red-500">*</span>
          </label>
          {photoPreview ? (
            <div className="relative w-full max-w-xs">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={photoPreview}
                  alt="Photo preview"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview("");
                    setPhotoUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-medium hover:bg-white"
                >
                  Change
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Click to upload a photo
              </span>
              <span className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP (max 5MB)
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Boat Selector */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Which boat were you on? <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Search boats by name or city..."
            value={boatSearch}
            onChange={(e) => setBoatSearch(e.target.value)}
            className="mb-2"
          />
          <select
            value={formData.boatId}
            onChange={(e) =>
              setFormData({ ...formData, boatId: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Select a boat</option>
            {filteredBoats.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} - {b.cityName}, {b.stateCode}
              </option>
            ))}
          </select>
        </div>

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Your Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={formData.submitterName}
              onChange={(e) =>
                setFormData({ ...formData, submitterName: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Email <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="email"
              value={formData.submitterEmail}
              onChange={(e) =>
                setFormData({ ...formData, submitterEmail: e.target.value })
              }
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Describe Your Catch <span className="text-red-500">*</span>
          </label>
          <Textarea
            required
            rows={3}
            value={formData.catchDescription}
            onChange={(e) =>
              setFormData({ ...formData, catchDescription: e.target.value })
            }
            placeholder="What did you catch? Tell us about your trip!"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting || uploading || !photoUrl}
          className="gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" /> Submit Your Catch
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
