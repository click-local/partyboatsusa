"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { USAMap } from "@mirawision/usa-map-react";

interface StateMapData {
  code: string;
  name: string;
  slug: string;
  boatCount: number;
}

interface USStatesMapProps {
  states: StateMapData[];
}

const PRIMARY = "#004685";
const GRAY = "#e5e7eb";
const GRAY_STROKE = "#d1d5db";

export function USStatesMap({ states }: USStatesMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const stateMap = useMemo(
    () => new Map(states.map((s) => [s.code, s])),
    [states]
  );

  const maxCount = useMemo(
    () => Math.max(...states.map((s) => s.boatCount), 1),
    [states]
  );

  const handleClick = useCallback(
    (code: string) => {
      const state = stateMap.get(code);
      if (state && state.boatCount > 0) {
        router.push(`/states/${state.slug}`);
      }
    },
    [stateMap, router]
  );

  const getFill = useCallback(
    (code: string, isHovered: boolean) => {
      const state = stateMap.get(code);
      if (!state || state.boatCount === 0) {
        return isHovered ? "#d1d5db" : GRAY;
      }
      if (isHovered) return PRIMARY;
      const intensity = 0.4 + 0.6 * (state.boatCount / maxCount);
      return `hsla(210, 100%, 26%, ${intensity})`;
    },
    [stateMap, maxCount]
  );

  const customStates = useMemo(() => {
    const config: Record<string, object> = {};
    for (const s of states) {
      const isHovered = hoveredState === s.code;
      config[s.code] = {
        fill: getFill(s.code, isHovered),
        stroke: s.boatCount > 0 ? "#ffffff" : GRAY_STROKE,
        onClick: () => handleClick(s.code),
        onHover: () => setHoveredState(s.code),
        onLeave: () => setHoveredState(null),
        tooltip: {
          enabled: true,
          render: () => (
            <div className="bg-white rounded-lg shadow-lg px-4 py-3 min-w-[180px] border border-gray-100">
              <p className="font-display font-bold text-sm text-gray-900">
                {s.name}
              </p>
              {s.boatCount > 0 ? (
                <>
                  <p className="text-sm text-primary font-semibold mt-0.5">
                    {s.boatCount} {s.boatCount === 1 ? "party boat" : "party boats"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to explore &rarr;
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  No boats listed yet
                </p>
              )}
            </div>
          ),
        },
      };
    }
    return config;
  }, [states, hoveredState, getFill, handleClick]);

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Interactive map of the United States showing party boat fishing destinations"
    >
      <USAMap customStates={customStates} />
    </div>
  );
}
