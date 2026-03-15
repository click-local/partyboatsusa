"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Fish, Search, ChevronRight, Ship, MapPin, Ruler } from "lucide-react";

interface SpeciesItem {
  id: number;
  name: string;
  slug: string;
  scientificName: string | null;
  description: string | null;
  habitat: string | null;
  sizeRange: string | null;
  fightRating: string | null;
  imageUrl: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  boatCount: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number | null;
}

export function SpeciesIndexClient({
  species,
  categories,
}: {
  species: SpeciesItem[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  const filtered = species.filter((sp) => {
    const matchesSearch =
      !query ||
      sp.name.toLowerCase().includes(query.toLowerCase()) ||
      (sp.scientificName && sp.scientificName.toLowerCase().includes(query.toLowerCase()));
    const matchesCat = selectedCategory === "" || sp.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Group by category for display
  const grouped = new Map<string, SpeciesItem[]>();
  for (const sp of filtered) {
    const catName = sp.categoryName || "Other";
    if (!grouped.has(catName)) grouped.set(catName, []);
    grouped.get(catName)!.push(sp);
  }

  const isFiltered = !!query || selectedCategory !== "";

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search species by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : "")}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {isFiltered && (
          <button
            onClick={() => { setQuery(""); setSelectedCategory(""); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        {isFiltered
          ? `Showing ${filtered.length} of ${species.length} species`
          : `${species.length} species`}
      </p>

      {/* Grouped display when not searching */}
      {!query && selectedCategory === "" ? (
        // Category sections
        <div className="space-y-10">
          {categories.map((cat) => {
            const catSpecies = species.filter((s) => s.categoryId === cat.id);
            if (catSpecies.length === 0) return null;
            return (
              <div key={cat.id}>
                <Link
                  href={`/species/category/${cat.slug}`}
                  className="flex items-center gap-2 text-xl font-display font-bold mb-4 border-b pb-2 hover:text-primary transition-colors group"
                >
                  {cat.name}
                  <span className="text-sm font-normal text-muted-foreground group-hover:text-primary">
                    ({catSpecies.length})
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto" />
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catSpecies.map((sp) => (
                    <SpeciesCard key={sp.id} species={sp} />
                  ))}
                </div>
              </div>
            );
          })}
          {/* Uncategorized */}
          {species.filter((s) => !s.categoryId).length > 0 && (
            <div>
              <h2 className="text-xl font-display font-bold mb-4 border-b pb-2">Other Species</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {species.filter((s) => !s.categoryId).map((sp) => (
                  <SpeciesCard key={sp.id} species={sp} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Flat filtered list
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sp) => (
            <SpeciesCard key={sp.id} species={sp} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No species found matching your search.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SpeciesCard({ species }: { species: SpeciesItem }) {
  return (
    <Link
      href={`/species/${species.slug}`}
      className="group flex items-center gap-3 p-3 bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
    >
      {species.imageUrl ? (
        <Image
          src={species.imageUrl}
          alt={species.name}
          width={120}
          height={80}
          className="flex-shrink-0 w-[120px] h-[80px] object-contain group-hover:scale-105 transition-transform"
        />
      ) : (
        <Fish className="flex-shrink-0 w-[120px] h-[80px] p-5 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">
          {species.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
          {species.habitat && (
            <span className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              {species.habitat}
            </span>
          )}
          {species.sizeRange && (
            <span className="flex items-center gap-1">
              <Ruler className="h-2.5 w-2.5 flex-shrink-0" />
              {species.sizeRange}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ship className="h-2.5 w-2.5 flex-shrink-0" />
            {species.boatCount} {species.boatCount === 1 ? "charter" : "charters"}
          </span>
        </div>
        {species.description && (
          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {species.description}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}
