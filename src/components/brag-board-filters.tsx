"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter, X } from "lucide-react";

interface StateOption {
  code: string;
  name: string;
}

interface SpeciesOption {
  id: number;
  name: string;
}

interface BragBoardFiltersProps {
  states: StateOption[];
  speciesList: SpeciesOption[];
}

export function BragBoardFilters({ states, speciesList }: BragBoardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentState = searchParams.get("state") || "";
  const currentSpecies = searchParams.get("species") || "";
  const hasFilters = currentState || currentSpecies;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to no page param when filters change
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/brag-board?${qs}` : "/brag-board");
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/brag-board");
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* State filter */}
      <select
        value={currentState}
        onChange={(e) => updateFilter("state", e.target.value)}
        className="h-9 rounded-lg border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All States</option>
        {states.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Species filter */}
      <select
        value={currentSpecies}
        onChange={(e) => updateFilter("species", e.target.value)}
        className="h-9 rounded-lg border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All Species</option>
        {speciesList.map((sp) => (
          <option key={sp.id} value={sp.id}>
            {sp.name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
