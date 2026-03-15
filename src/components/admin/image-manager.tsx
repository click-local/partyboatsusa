"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, RefreshCw, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface ImageManagerProps {
  primaryImageUrl: string;
  imageFocalPointX: number;
  imageFocalPointY: number;
  galleryImageUrls: string[];
  onPrimaryImageChange: (url: string) => void;
  onFocalPointChange: (x: number, y: number) => void;
  onGalleryChange: (urls: string[]) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_GALLERY = 20;

async function uploadFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error("Only JPEG, PNG, and WebP images are allowed");
    return null;
  }
  if (file.size > MAX_SIZE) {
    toast.error("File size must be under 5MB");
    return null;
  }
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Upload failed");
      return null;
    }
    return data.url;
  } catch {
    toast.error("Upload failed");
    return null;
  }
}

export function ImageManager({
  primaryImageUrl,
  imageFocalPointX,
  imageFocalPointY,
  galleryImageUrls,
  onPrimaryImageChange,
  onFocalPointChange,
  onGalleryChange,
}: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [galleryUrlValue, setGalleryUrlValue] = useState("");
  const [dragging, setDragging] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Primary image upload
  const handlePrimaryUpload = useCallback(async (file: File) => {
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) onPrimaryImageChange(url);
  }, [onPrimaryImageChange]);

  const handlePrimaryFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePrimaryUpload(file);
    if (primaryInputRef.current) primaryInputRef.current.value = "";
  }, [handlePrimaryUpload]);

  // Gallery image upload
  const handleGalleryUpload = useCallback(async (file: File) => {
    if (galleryImageUrls.length >= MAX_GALLERY) {
      toast.error(`Maximum ${MAX_GALLERY} gallery images allowed`);
      return;
    }
    setGalleryUploading(true);
    const url = await uploadFile(file);
    setGalleryUploading(false);
    if (url) onGalleryChange([...galleryImageUrls, url]);
  }, [galleryImageUrls, onGalleryChange]);

  const handleGalleryFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleGalleryUpload(file);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }, [handleGalleryUpload]);

  // Focal point click
  function handleFocalPointClick(e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onFocalPointChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  }

  // Drag and drop handlers
  function handleDragOver(e: React.DragEvent, setDragState: (v: boolean) => void) {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  }

  function handleDragLeave(e: React.DragEvent, setDragState: (v: boolean) => void) {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  }

  function handlePrimaryDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handlePrimaryUpload(file);
  }

  function handleGalleryDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleGalleryUpload(file);
  }

  // URL paste handlers
  function handlePrimaryUrlSubmit() {
    const url = urlValue.trim();
    if (url) {
      onPrimaryImageChange(url);
      setUrlValue("");
      setShowUrlInput(false);
    }
  }

  function handleGalleryUrlSubmit() {
    const url = galleryUrlValue.trim();
    if (!url) return;
    if (galleryImageUrls.length >= MAX_GALLERY) {
      toast.error(`Maximum ${MAX_GALLERY} gallery images allowed`);
      return;
    }
    onGalleryChange([...galleryImageUrls, url]);
    setGalleryUrlValue("");
  }

  function removeGalleryImage(index: number) {
    onGalleryChange(galleryImageUrls.filter((_, i) => i !== index));
  }

  return (
    <section className="bg-white rounded-xl border p-6 space-y-6">
      <h2 className="text-lg font-semibold">Images</h2>

      {/* Primary Image */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image</label>
          <p className="text-xs text-gray-500">Upload a high-quality photo of your boat. This is the main image shown on the listing and in search results.</p>
        </div>

        {primaryImageUrl ? (
          <div className="space-y-3">
            {/* Image with focal point picker */}
            <div className="relative inline-block cursor-crosshair max-w-lg w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImageUrl}
                alt="Primary"
                className="w-full rounded-lg"
                onClick={handleFocalPointClick}
                draggable={false}
              />
              {/* Focal point crosshair */}
              <div
                className="absolute w-7 h-7 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${imageFocalPointX}%`,
                  top: `${imageFocalPointY}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(59,130,246,0.8)",
                  background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 60%)",
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => primaryInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={() => onPrimaryImageChange("")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
              <span className="text-xs text-gray-400 ml-auto">
                Focal point: {imageFocalPointX}%, {imageFocalPointY}%
              </span>
            </div>

            {/* Focal point instruction */}
            <p className="text-xs text-gray-500">
              Click on the image to set the focal point. This controls what stays visible when the image is cropped in different layouts.
            </p>

            {/* Live previews */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Live Previews</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Card (16:10)</p>
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${imageFocalPointX}% ${imageFocalPointY}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Hero (21:9)</p>
                  <div className="aspect-[21/9] rounded-lg overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${imageFocalPointX}% ${imageFocalPointY}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Upload drop zone */
          <div
            onDragOver={(e) => handleDragOver(e, setDragging)}
            onDragLeave={(e) => handleDragLeave(e, setDragging)}
            onDrop={handlePrimaryDrop}
            onClick={() => !uploading && primaryInputRef.current?.click()}
            className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              dragging
                ? "border-blue-400 bg-blue-50 text-blue-600"
                : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">Drop an image here or click to browse</span>
                <span className="text-xs text-gray-400">JPEG, PNG, or WebP up to 5MB</span>
              </>
            )}
          </div>
        )}

        {/* URL paste toggle */}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          <LinkIcon className="h-3 w-3" />
          Or paste image URL
          {showUrlInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showUrlInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePrimaryUrlSubmit())}
              placeholder="https://..."
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handlePrimaryUrlSubmit}
              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Set
            </button>
          </div>
        )}

        <input
          ref={primaryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePrimaryFileChange}
          className="hidden"
        />
      </div>

      {/* Gallery Images */}
      <div className="space-y-3 border-t pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gallery Images {galleryImageUrls.length > 0 && `(${galleryImageUrls.length} of ${MAX_GALLERY})`}
          </label>
          <p className="text-xs text-gray-500">Additional photos shown in the gallery section on Pro listings.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {galleryImageUrls.map((url, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-gray-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {galleryImageUrls.length < MAX_GALLERY && (
            <div
              onDragOver={(e) => handleDragOver(e, setGalleryDragging)}
              onDragLeave={(e) => handleDragLeave(e, setGalleryDragging)}
              onDrop={handleGalleryDrop}
              onClick={() => !galleryUploading && galleryInputRef.current?.click()}
              className={`aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                galleryDragging
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500"
              }`}
            >
              {galleryUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Add Photo</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Gallery URL paste toggle */}
        <button
          type="button"
          onClick={() => setShowGalleryUrlInput(!showGalleryUrlInput)}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          <LinkIcon className="h-3 w-3" />
          Or paste image URL
          {showGalleryUrlInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showGalleryUrlInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={galleryUrlValue}
              onChange={(e) => setGalleryUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGalleryUrlSubmit())}
              placeholder="https://..."
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleGalleryUrlSubmit}
              className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleGalleryFileChange}
          className="hidden"
        />
      </div>
    </section>
  );
}
