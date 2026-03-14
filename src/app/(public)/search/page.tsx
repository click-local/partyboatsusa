"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BoatCard } from "@/components/boat-card";
import type { SelectBoat } from "@/lib/db/schema";

interface StateOption { code: string; name: string; }
interface AmenityOption { id: number; name: string; slug: string; }

const SORT_OPTIONS = [
  { value: "featured", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "capacity", label: "Largest Capacity" },
];

const RATING_STEPS = [0, 1, 2, 3, 3.5, 4, 4.5, 5];

interface SearchResult {
  boats: SelectBoat[];
  total: number;
  page: number;
  totalPages: number;
  tierBadges?: Record<number, { name: string; color: string }>;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedStates, setSelectedStates] = useState<string[]>(
    searchParams.get("states")?.split(",").filter(Boolean) || []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean).map(Number) || []
  );
  const [minRating, setMinRating] = useState(Number(searchParams.get("minRating")) || 0);
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Load filter options from API
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<AmenityOption[]>([]);

  useEffect(() => {
    // Fetch states and amenities that have listings
    fetch("/api/boats/search?limit=0&meta=filters")
      .then((r) => r.json())
      .then((data) => {
        if (data.states) setStateOptions(data.states);
        if (data.amenities) setAmenityOptions(data.amenities);
      })
      .catch(() => {});
  }, []);

  const fetchBoats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (selectedStates.length) params.set("states", selectedStates.join(","));
      if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","));
      if (minRating > 0) params.set("minRating", String(minRating));
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "18");

      const res = await fetch(`/api/boats/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedStates, selectedAmenities, sort, page, minRating]);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedStates.length) params.set("states", selectedStates.join(","));
    if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","));
    if (sort !== "featured") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    if (minRating > 0) params.set("minRating", String(minRating));
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [query, selectedStates, selectedAmenities, sort, page, minRating, router]);

  const toggleState = (code: string) => {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
    setPage(1);
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedStates([]);
    setSelectedAmenities([]);
    setMinRating(0);
    setSort("featured");
    setPage(1);
  };

  const activeFilterCount = selectedStates.length + selectedAmenities.length + (query ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* State Filter */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">State</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stateOptions.map((s) => (
            <label key={s.code} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedStates.includes(s.code)}
                onCheckedChange={() => toggleState(s.code)}
              />
              <span className="text-sm font-medium">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      {amenityOptions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Amenities</h3>
          <div className="space-y-2">
            {amenityOptions.map((a) => (
              <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedAmenities.includes(a.id)}
                  onCheckedChange={() => toggleAmenity(a.id)}
                />
                <span className="text-sm font-medium">{a.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Minimum Rating</h3>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1); }}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {minRating > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {minRating}+ stars
                </span>
              ) : "Any"}
            </span>
          </div>
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Reset Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-bold mb-4 text-center">
            Browse Party Boats
          </h1>
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by boat name, location, or operator..."
                className="pl-9 bg-white text-foreground"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 justify-center">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 overflow-y-auto">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {loading ? "Searching..." : `${results?.total ?? 0} boats found`}
                </p>
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-sm border rounded-md px-3 py-2 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters */}
            {(selectedStates.length > 0 || selectedAmenities.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedStates.map((code) => (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {code}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleState(code)}
                    />
                  </Badge>
                ))}
                {selectedAmenities.map((id) => {
                  const am = amenityOptions.find((a) => a.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {am?.name || id}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleAmenity(id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg h-80 animate-pulse"
                  />
                ))}
              </div>
            ) : results && results.boats.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.boats.map((boat) => (
                    <BoatCard
                      key={boat.id}
                      boat={boat}
                      tierBadge={boat.operatorId && results.tierBadges?.[boat.operatorId] || null}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {results.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page} of {results.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= results.totalPages}
                      onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No boats found matching your search criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
