"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Ship, Fish } from "lucide-react";

interface StateMapData {
  code: string;
  name: string;
  slug: string;
  boatCount: number;
}

interface SpeciesInfo {
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface StateListGridProps {
  states: StateMapData[];
  speciesByState?: Record<string, SpeciesInfo[]>;
}

export function StateListGrid({ states, speciesByState = {} }: StateListGridProps) {
  const activeStates = states
    .filter((s) => s.boatCount > 0)
    .sort((a, b) => b.boatCount - a.boatCount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activeStates.map((state) => {
        const topSpecies = speciesByState[state.code] || [];
        return (
          <div
            key={state.code}
            className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* State header row */}
            <Link
              href={`/states/${state.slug}`}
              className="group flex items-center gap-4 p-4 pb-3"
            >
              <div className="flex-shrink-0 w-14 h-10 rounded overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={`https://flagcdn.com/w160/us-${state.code.toLowerCase()}.png`}
                  alt={`${state.name} flag`}
                  width={56}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                  {state.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Ship className="h-3.5 w-3.5 flex-shrink-0" />
                  {state.boatCount} {state.boatCount === 1 ? "charter" : "charters"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>

            {/* Scrollable species row */}
            {topSpecies.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                  Popular Species
                </p>
                <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
                  {topSpecies.map((sp) => (
                    <Link
                      key={sp.slug}
                      href={`/species/${sp.slug}/${state.slug}`}
                      className="group/sp flex flex-col items-center gap-1.5 flex-shrink-0"
                      title={sp.name}
                    >
                      {sp.imageUrl ? (
                        <Image
                          src={sp.imageUrl}
                          alt={sp.name}
                          width={72}
                          height={72}
                          className="w-[72px] h-[72px] object-contain group-hover/sp:scale-110 transition-transform"
                        />
                      ) : (
                        <Fish className="w-[72px] h-[72px] p-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground text-center leading-tight max-w-[80px] group-hover/sp:text-primary transition-colors">
                        {sp.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
