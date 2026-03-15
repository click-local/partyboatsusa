"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Camera, CheckCircle, XCircle, Loader2, Clock, Pencil, X, Save,
} from "lucide-react";
import { toast } from "sonner";

interface SpeciesTag {
  id: number;
  name: string;
}

interface Photo {
  id: number;
  boatId: number;
  boatName: string;
  boatSlug: string;
  submitterName: string;
  submitterEmail: string | null;
  photoUrl: string;
  catchDescription: string;
  status: string;
  submittedAt: string;
  species: SpeciesTag[];
}

interface AllSpecies {
  id: number;
  name: string;
}

export default function AdminBragBoardPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [acting, setActing] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/admin/brag-board/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => toast.error("Failed to load photos"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(photo: Photo, action: "approve" | "reject") {
    setActing(photo.id);

    try {
      const res = await fetch("/api/admin/brag-board/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          action,
          boatId: photo.boatId,
          boatName: photo.boatName,
          boatSlug: photo.boatSlug,
          submitterName: photo.submitterName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Action failed");
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p
        )
      );
      toast.success(`Photo ${action === "approve" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActing(null);
    }
  }

  function handleSaveEdit(updated: Photo) {
    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPhoto(null);
  }

  const filtered = filter === "all" ? photos : photos.filter((p) => p.status === filter);
  const pendingCount = photos.filter((p) => p.status === "pending").length;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">
            Brag Board Photos
            {pendingCount > 0 && (
              <span className="ml-2 text-sm font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter === "all" ? "" : filter + " "}photos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={photo.photoUrl}
                  alt={photo.catchDescription}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {photo.boatName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={photo.status} />
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit photo"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {photo.catchDescription}
                </p>
                {photo.species.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {photo.species.map((s) => (
                      <span
                        key={s.id}
                        className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                {photo.species.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-medium">No species tagged</p>
                )}
                <div className="text-xs text-gray-500">
                  <p>By: {photo.submitterName}</p>
                  <p>{new Date(photo.submittedAt).toLocaleDateString()}</p>
                </div>
                {photo.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAction(photo, "approve")}
                      disabled={acting === photo.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === photo.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(photo, "reject")}
                      disabled={acting === photo.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function EditPhotoModal({
  photo,
  onClose,
  onSave,
}: {
  photo: Photo;
  onClose: () => void;
  onSave: (updated: Photo) => void;
}) {
  const [catchDescription, setCatchDescription] = useState(photo.catchDescription);
  const [submitterName, setSubmitterName] = useState(photo.submitterName);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesTag[]>(photo.species);
  const [allSpecies, setAllSpecies] = useState<AllSpecies[]>([]);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/species/search")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.species || []).map((s: AllSpecies) => ({
          id: s.id,
          name: s.name,
        }));
        setAllSpecies(list);
      })
      .catch(() => toast.error("Failed to load species"))
      .finally(() => setLoadingSpecies(false));
  }, []);

  const filteredSpecies = speciesSearch
    ? allSpecies.filter((s) =>
        s.name.toLowerCase().includes(speciesSearch.toLowerCase())
      )
    : allSpecies;

  const selectedIds = new Set(selectedSpecies.map((s) => s.id));

  function toggleSpecies(sp: AllSpecies) {
    if (selectedIds.has(sp.id)) {
      setSelectedSpecies((prev) => prev.filter((s) => s.id !== sp.id));
    } else {
      setSelectedSpecies((prev) => [...prev, { id: sp.id, name: sp.name }]);
    }
    setSpeciesSearch("");
  }

  function removeSpecies(id: number) {
    setSelectedSpecies((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSave() {
    if (!catchDescription.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!submitterName.trim()) {
      toast.error("Submitter name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/brag-board/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          catchDescription: catchDescription.trim(),
          submitterName: submitterName.trim(),
          speciesIds: selectedSpecies.map((s) => s.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      onSave({
        ...photo,
        catchDescription: catchDescription.trim(),
        submitterName: submitterName.trim(),
        species: selectedSpecies,
      });
      toast.success("Photo updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-600" />
            Edit Brag Board Photo
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo Preview */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-sm">
            <Image
              src={photo.photoUrl}
              alt={photo.catchDescription}
              fill
              className="object-cover"
              sizes="384px"
            />
          </div>

          <div className="text-xs text-gray-500">
            Boat: <span className="font-medium text-gray-700">{photo.boatName}</span>
            {" | "}Submitted: {new Date(photo.submittedAt).toLocaleDateString()}
            {" | "}Status: <StatusBadge status={photo.status} />
          </div>

          {/* Submitter Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Submitter Name</label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Catch Description</label>
            <textarea
              value={catchDescription}
              onChange={(e) => setCatchDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm resize-y"
            />
          </div>

          {/* Species */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Species</label>

            {/* Selected species chips */}
            {selectedSpecies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSpecies.map((sp) => (
                  <span
                    key={sp.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  >
                    {sp.name}
                    <button
                      type="button"
                      onClick={() => removeSpecies(sp.id)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loadingSpecies ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading species...
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="Search species to add..."
                  value={speciesSearch}
                  onChange={(e) => {
                    setSpeciesSearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredSpecies.length > 0 ? (
                        filteredSpecies.map((s) => {
                          const isSelected = selectedIds.has(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleSpecies(s)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : ""
                              }`}
                            >
                              {s.name}
                              {isSelected && (
                                <span className="text-blue-500 text-xs">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500">
                          No species found
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return <span className="text-xs text-gray-500">{status}</span>;
  }
}
