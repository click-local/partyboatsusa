"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Map, Loader2, Save, Upload, X, Plus, Trash2,
  GripVertical, Eye, EyeOff, Type, ImageIcon, LayoutGrid, Link2, Megaphone,
  ChevronUp, ChevronDown, Ship,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────
interface DestPage {
  id: number;
  type: string;
  referenceId: number;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  heroImageUrl: string | null;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  cardImageUrl: string | null;
  contentBlocks: ContentBlock[];
}

interface ContentBlock {
  id: number;
  destinationPageId: number;
  blockType: string;
  blockOrder: number;
  content: Record<string, unknown>;
  isVisible: boolean;
}

interface StateItem { id: number; name: string; code: string; slug: string }
interface CityItem { id: number; name: string; slug: string; stateCode: string }

const BLOCK_TYPES = [
  { type: "text", label: "Text", icon: Type, description: "Heading + body text" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Single image with caption" },
  { type: "gallery", label: "Gallery", icon: LayoutGrid, description: "Image grid" },
  { type: "links", label: "Links", icon: Link2, description: "Link list" },
  { type: "cta", label: "CTA", icon: Megaphone, description: "Call to action" },
  { type: "boats", label: "Boat Listings", icon: Ship, description: "Boats from this area" },
];

// ── Image Upload Component ─────────────────────────────────────────
function ImageUploader({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Upload failed"); return; }
      onChange(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="w-full h-40 object-cover rounded-lg border" />
          <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
            <X className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded text-xs text-gray-700 hover:bg-white">
            {uploading ? "Uploading..." : "Replace"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <>
              <Upload className="h-6 w-6" />
              <span className="text-xs">Click to upload</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      {value && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded px-2 py-1 text-xs text-gray-500 mt-1" placeholder="Or paste URL" />
      )}
      {!value && (
        <input type="text" value="" onChange={(e) => { if (e.target.value) onChange(e.target.value); }} className="w-full border rounded px-2 py-1 text-xs text-gray-500 mt-1" placeholder="Or paste image URL" />
      )}
    </div>
  );
}

// ── Block Editors ──────────────────────────────────────────────────
function TextBlockEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <input value={(content.heading as string) || ""} onChange={(e) => onChange({ ...content, heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm font-medium" placeholder="Heading (optional)" />
      <textarea value={(content.body as string) || ""} onChange={(e) => onChange({ ...content, body: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={5} placeholder="Body text..." />
    </div>
  );
}

function ImageBlockEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <ImageUploader value={(content.imageUrl as string) || ""} onChange={(url) => onChange({ ...content, imageUrl: url })} label="Image" />
      <input value={(content.alt as string) || ""} onChange={(e) => onChange({ ...content, alt: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Alt text" />
      <input value={(content.caption as string) || ""} onChange={(e) => onChange({ ...content, caption: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Caption (optional)" />
    </div>
  );
}

function GalleryBlockEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const images = (content.images as Array<{ url: string; alt?: string }>) || [];
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onChange({ ...content, images: [...images, { url: data.url, alt: "" }] });
      }
    } catch { /* noop */ } finally {
      setUploading(false);
      if (addImageInputRef.current) addImageInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input value={(content.heading as string) || ""} onChange={(e) => onChange({ ...content, heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Gallery heading (optional)" />
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img.url} alt={img.alt || ""} className="w-full h-24 object-cover rounded border" />
            <button type="button" onClick={() => onChange({ ...content, images: images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addImageInputRef.current?.click()} disabled={uploading} className="h-24 rounded border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center text-gray-400 hover:text-blue-500">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>
      <input ref={addImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAddImage} className="hidden" />
    </div>
  );
}

function LinksBlockEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const links = (content.links as Array<{ label: string; url: string }>) || [];
  return (
    <div className="space-y-3">
      <input value={(content.heading as string) || ""} onChange={(e) => onChange({ ...content, heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Links heading (optional)" />
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={link.label} onChange={(e) => { const updated = [...links]; updated[i] = { ...link, label: e.target.value }; onChange({ ...content, links: updated }); }} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Link label" />
          <input value={link.url} onChange={(e) => { const updated = [...links]; updated[i] = { ...link, url: e.target.value }; onChange({ ...content, links: updated }); }} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="URL" />
          <button type="button" onClick={() => onChange({ ...content, links: links.filter((_, j) => j !== i) })} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...content, links: [...links, { label: "", url: "" }] })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
        <Plus className="h-3 w-3" /> Add Link
      </button>
    </div>
  );
}

function CtaBlockEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <input value={(content.heading as string) || ""} onChange={(e) => onChange({ ...content, heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="CTA Heading" />
      <textarea value={(content.body as string) || ""} onChange={(e) => onChange({ ...content, body: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="CTA body text" />
      <div className="grid grid-cols-2 gap-3">
        <input value={(content.buttonText as string) || ""} onChange={(e) => onChange({ ...content, buttonText: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" placeholder="Button text" />
        <input value={(content.buttonUrl as string) || ""} onChange={(e) => onChange({ ...content, buttonUrl: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" placeholder="Button URL" />
      </div>
    </div>
  );
}

function BoatsBlockEditor({ content, onChange, pageType }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; pageType: string }) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <Ship className="h-4 w-4 inline mr-1" />
          This block will automatically display all published boats from this {pageType === "city" ? "city" : "state"}.
        </p>
      </div>
      <input value={(content.heading as string) || ""} onChange={(e) => onChange({ ...content, heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Section heading (optional, e.g. 'Available Party Boats')" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max boats to show (0 = all)</label>
          <input type="number" value={(content.limit as number) || 0} onChange={(e) => onChange({ ...content, limit: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm" min={0} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort by</label>
          <select value={(content.sortBy as string) || "rating"} onChange={(e) => onChange({ ...content, sortBy: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="capacity">Capacity</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, content, onChange, pageType }: { block: ContentBlock; content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; pageType?: string }) {
  switch (block.blockType) {
    case "text": return <TextBlockEditor content={content} onChange={onChange} />;
    case "image": return <ImageBlockEditor content={content} onChange={onChange} />;
    case "gallery": return <GalleryBlockEditor content={content} onChange={onChange} />;
    case "links": return <LinksBlockEditor content={content} onChange={onChange} />;
    case "cta": return <CtaBlockEditor content={content} onChange={onChange} />;
    case "boats": return <BoatsBlockEditor content={content} onChange={onChange} pageType={pageType || "state"} />;
    default: return <p className="text-sm text-gray-400">Unknown block type: {block.blockType}</p>;
  }
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminEditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<DestPage | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  // Track unsaved block content changes locally
  const [blockEdits, setBlockEdits] = useState<Record<number, Record<string, unknown>>>({});

  useEffect(() => {
    async function load() {
      try {
        const [pageRes, refRes] = await Promise.all([
          fetch(`/api/admin/destination-pages/${params.id}`).then((r) => r.json()),
          fetch("/api/admin/destination-pages").then((r) => r.json()),
        ]);
        if (pageRes.error) { toast.error(pageRes.error); return; }
        setPage(pageRes);
        setBlocks(Array.isArray(pageRes.contentBlocks) ? pageRes.contentBlocks : []);
        setStatesList(Array.isArray(refRes.states) ? refRes.states : []);
        setCitiesList(Array.isArray(refRes.cities) ? refRes.cities : []);
      } catch {
        toast.error("Failed to load destination page");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  function getPageName(): string {
    if (!page) return "";
    if (page.type === "state") {
      const st = statesList.find((s) => s.id === page.referenceId);
      return st?.name || `State #${page.referenceId}`;
    }
    if (page.type === "city") {
      const ct = citiesList.find((c) => c.id === page.referenceId);
      return ct?.name || `City #${page.referenceId}`;
    }
    return page.heroHeadline || `Page #${page.id}`;
  }

  // ── Save everything (page metadata + all block content) ──
  async function handleSavePage() {
    if (!page) return;
    setSaving(true);
    try {
      // 1. Save page metadata
      const { contentBlocks: _cb, ...pageData } = page;
      const pageRes = await fetch(`/api/admin/destination-pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      if (!pageRes.ok) {
        const err = await pageRes.json().catch(() => ({}));
        toast.error(err.error || "Failed to save page");
        setSaving(false);
        return;
      }
      const saved = await pageRes.json();

      // 2. Save ALL block content (not just edited ones - save everything to be safe)
      const blockSaveResults = await Promise.all(
        blocks.map((block) => {
          const editedContent = blockEdits[block.id] || block.content;
          return fetch(`/api/admin/content-blocks/${block.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editedContent, isVisible: block.isVisible, blockOrder: block.blockOrder }),
          }).then((r) => r.json());
        })
      );

      // Update local state with saved blocks
      setBlocks(blockSaveResults);
      setBlockEdits({});
      setPage({ ...saved, contentBlocks: blockSaveResults });
      toast.success(saved.isPublished ? "Page saved & published" : "Page saved as draft");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Block CRUD ────────────────────────────────────────
  async function addBlock(blockType: string) {
    if (!page) return;
    const newOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.blockOrder)) + 1 : 0;
    const res = await fetch("/api/admin/content-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationPageId: page.id, blockType, blockOrder: newOrder, content: {}, isVisible: true }),
    });
    if (res.ok) {
      const block = await res.json();
      setBlocks((prev) => [...prev, block]);
      setShowAddBlock(false);
      toast.success(`${blockType} block added`);
    }
  }

  async function saveBlock(block: ContentBlock) {
    const editedContent = blockEdits[block.id] || block.content;
    const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editedContent, isVisible: block.isVisible, blockOrder: block.blockOrder }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setBlockEdits((prev) => { const next = { ...prev }; delete next[block.id]; return next; });
      toast.success("Block saved");
    }
  }

  async function deleteBlock(blockId: number) {
    if (!confirm("Delete this content block?")) return;
    const res = await fetch(`/api/admin/content-blocks/${blockId}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      toast.success("Block deleted");
    }
  }

  async function toggleBlockVisibility(block: ContentBlock) {
    const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !block.isVisible }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  }

  async function moveBlock(blockId: number, direction: "up" | "down") {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= blocks.length) return;

    const reordered = [...blocks];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    // Update block orders
    const updates = reordered.map((b, i) => ({ ...b, blockOrder: i }));
    setBlocks(updates);

    // Persist both swapped blocks
    await Promise.all([
      fetch(`/api/admin/content-blocks/${updates[idx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockOrder: updates[idx].blockOrder }),
      }),
      fetch(`/api/admin/content-blocks/${updates[swapIdx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockOrder: updates[swapIdx].blockOrder }),
      }),
    ]);
  }

  function updateBlockContent(blockId: number, content: Record<string, unknown>) {
    setBlockEdits((prev) => ({ ...prev, [blockId]: content }));
  }

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Destination page not found.</p>
        <Link href="/admin/destination-pages" className="text-blue-600 hover:underline text-sm">Back to Destinations</Link>
      </div>
    );
  }

  const blockTypeInfo = (type: string) => BLOCK_TYPES.find((bt) => bt.type === type);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/destination-pages" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Map className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Edit: {getPageName()}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage({ ...page, isPublished: !page.isPublished })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${page.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {page.isPublished ? "Published" : "Draft"}
          </button>
          <button onClick={handleSavePage} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Page
          </button>
        </div>
      </div>

      {/* Draft Warning Banner */}
      {!page.isPublished && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">This page is in Draft mode</p>
            <p className="text-xs text-amber-600">It will not be visible on the public site until published.</p>
          </div>
          <button
            onClick={() => setPage({ ...page, isPublished: true })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Set to Published
          </button>
        </div>
      )}

      {/* Hero Images */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Hero Section</h2>
        <div className="grid grid-cols-2 gap-6">
          <ImageUploader
            value={page.heroImageUrl || ""}
            onChange={(url) => setPage({ ...page, heroImageUrl: url || null })}
            label="Hero Image"
          />
          <ImageUploader
            value={page.cardImageUrl || ""}
            onChange={(url) => setPage({ ...page, cardImageUrl: url || null })}
            label="Card Image (used in listings)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label>
            <input
              value={page.heroHeadline || ""}
              onChange={(e) => setPage({ ...page, heroHeadline: e.target.value || null })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Party Boats in Florida"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subheadline</label>
            <input
              value={page.heroSubheadline || ""}
              onChange={(e) => setPage({ ...page, heroSubheadline: e.target.value || null })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Find the best party boats..."
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">SEO</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
          <input
            value={page.seoTitle || ""}
            onChange={(e) => setPage({ ...page, seoTitle: e.target.value || null })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
          <textarea
            value={page.seoDescription || ""}
            onChange={(e) => setPage({ ...page, seoDescription: e.target.value || null })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
          <input
            value={page.seoKeywords || ""}
            onChange={(e) => setPage({ ...page, seoKeywords: e.target.value || null })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="comma-separated"
          />
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Content Blocks</h2>
          <button onClick={() => setShowAddBlock(!showAddBlock)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Block
          </button>
        </div>

        {/* Add Block Picker */}
        {showAddBlock && (
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500 mb-3">Choose a block type:</p>
            <div className="grid grid-cols-5 gap-3">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <bt.icon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">{bt.label}</span>
                  <span className="text-xs text-gray-400">{bt.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Block List */}
        {blocks.length === 0 && !showAddBlock && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
            <p>No content blocks yet. Click &ldquo;Add Block&rdquo; to get started.</p>
          </div>
        )}

        {blocks.map((block, idx) => {
          const info = blockTypeInfo(block.blockType);
          const Icon = info?.icon || Type;
          const editedContent = blockEdits[block.id] || block.content;
          const hasUnsaved = !!blockEdits[block.id];

          return (
            <div key={block.id} className={`bg-white rounded-xl border overflow-hidden ${!block.isVisible ? "opacity-60" : ""}`}>
              {/* Block header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <Icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium capitalize">{block.blockType}</span>
                {!block.isVisible && <span className="text-xs text-gray-400 ml-1">(hidden)</span>}
                {hasUnsaved && <span className="text-xs text-amber-500 ml-1">unsaved</span>}
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <button onClick={() => moveBlock(block.id, "up")} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveBlock(block.id, "down")} disabled={idx === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleBlockVisibility(block)} className="p-1 text-gray-400 hover:text-gray-600" title={block.isVisible ? "Hide" : "Show"}>
                    {block.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => saveBlock(block)} className="p-1 text-blue-500 hover:text-blue-700" title="Save block">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteBlock(block.id)} className="p-1 text-red-400 hover:text-red-600" title="Delete block">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Block content editor */}
              <div className="p-4">
                <BlockEditor block={block} content={editedContent} onChange={(c) => updateBlockContent(block.id, c)} pageType={page?.type} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
