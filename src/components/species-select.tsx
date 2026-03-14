"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ChevronDown, ChevronRight, Fish, Plus } from "lucide-react";

interface SpeciesOption {
  id: number;
  name: string;
  slug?: string;
  scientificName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface SpeciesSelectProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /** Show the "Suggest a Species" button (operator mode) */
  showSuggest?: boolean;
  onSuggest?: () => void;
}

export function SpeciesSelect({ selectedIds, onChange, showSuggest, onSuggest }: SpeciesSelectProps) {
  const [allSpecies, setAllSpecies] = useState<SpeciesOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<SpeciesOption[] | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load all species on mount
  useEffect(() => {
    fetch("/api/species/search")
      .then((r) => r.json())
      .then((data) => {
        setAllSpecies(data.species || []);
        setCategories(data.categories || []);
      })
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/species/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setSearchResults(data.species || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setBrowseMode(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSpecies = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange]
  );

  const removeSpecies = useCallback(
    (id: number) => {
      onChange(selectedIds.filter((sid) => sid !== id));
    },
    [selectedIds, onChange]
  );

  const toggleCategory = (catId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const selectedSpecies = allSpecies.filter((s) => selectedIds.includes(s.id));
  const displayList = searchResults ?? allSpecies;
  const speciesByCategory = new Map<number | null, SpeciesOption[]>();
  for (const sp of displayList) {
    const catId = sp.categoryId ?? null;
    if (!speciesByCategory.has(catId)) speciesByCategory.set(catId, []);
    speciesByCategory.get(catId)!.push(sp);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {selectedSpecies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedSpecies.map((sp) => (
            <span
              key={sp.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full text-sm border border-blue-200"
            >
              <Fish className="w-3 h-3" />
              {sp.name}
              <button
                type="button"
                onClick={() => removeSpecies(sp.id)}
                className="ml-0.5 hover:text-blue-600 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search species by name or alias..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setBrowseMode(false);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-24 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => {
            setBrowseMode(!browseMode);
            setIsOpen(true);
            setQuery("");
            setSearchResults(null);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          {browseMode ? "Close" : "Browse All"}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (query.trim() || browseMode) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}

          {!loading && searchResults && searchResults.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No species found for &ldquo;{query}&rdquo;
              {showSuggest && onSuggest && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSuggest();
                  }}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Suggest this species
                </button>
              )}
            </div>
          )}

          {!loading && browseMode && !query.trim() && (
            // Browse mode: show categories
            <div>
              {categories.map((cat) => {
                const catSpecies = speciesByCategory.get(cat.id) || [];
                if (catSpecies.length === 0) return null;
                const isExpanded = expandedCategories.has(cat.id);
                return (
                  <div key={cat.id}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border-b border-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {cat.name}
                      <span className="text-xs text-gray-400 font-normal">
                        ({catSpecies.length})
                      </span>
                    </button>
                    {isExpanded &&
                      catSpecies.map((sp) => (
                        <SpeciesRow
                          key={sp.id}
                          species={sp}
                          isSelected={selectedIds.includes(sp.id)}
                          onToggle={() => toggleSpecies(sp.id)}
                          indent
                        />
                      ))}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !browseMode && searchResults && searchResults.length > 0 && (
            // Search results
            <div>
              {searchResults.map((sp) => (
                <SpeciesRow
                  key={sp.id}
                  species={sp}
                  isSelected={selectedIds.includes(sp.id)}
                  onToggle={() => toggleSpecies(sp.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggest button for operators */}
      {showSuggest && onSuggest && (
        <button
          type="button"
          onClick={onSuggest}
          className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Can&apos;t find a species? Suggest one to be added
        </button>
      )}

      <p className="mt-1 text-xs text-gray-400">
        {selectedIds.length} species selected
      </p>
    </div>
  );
}

// Individual species row in dropdown
function SpeciesRow({
  species,
  isSelected,
  onToggle,
  indent,
}: {
  species: SpeciesOption;
  isSelected: boolean;
  onToggle: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-blue-50 transition-colors border-b border-gray-50 ${
        indent ? "pl-8" : ""
      } ${isSelected ? "bg-blue-50 text-blue-800" : "text-gray-700"}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{species.name}</span>
        {species.scientificName && (
          <span className="ml-2 text-xs text-gray-400 italic">
            {species.scientificName}
          </span>
        )}
        {species.categoryName && !indent && (
          <span className="ml-2 text-xs text-gray-400">
            {species.categoryName}
          </span>
        )}
      </div>
    </button>
  );
}
