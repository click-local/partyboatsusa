"use client";

import Link from "next/link";
import { ChevronRight, Ship } from "lucide-react";

interface StateMapData {
  code: string;
  name: string;
  slug: string;
  boatCount: number;
}

interface StateListGridProps {
  states: StateMapData[];
}

export function StateListGrid({ states }: StateListGridProps) {
  const activeStates = states.filter((s) => s.boatCount > 0);
  const inactiveStates = states.filter((s) => s.boatCount === 0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {activeStates.map((state) => (
          <Link
            key={state.code}
            href={`/states/${state.slug}`}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-white hover:border-primary/30 hover:shadow-card transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <Ship className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {state.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {state.boatCount}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {inactiveStates.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Coming Soon
          </p>
          <p className="text-sm text-muted-foreground/70">
            {inactiveStates.map((s) => s.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
