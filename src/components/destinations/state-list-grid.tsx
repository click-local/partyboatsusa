"use client";

import Link from "next/link";
import Image from "next/image";

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {activeStates.map((state) => (
        <Link
          key={state.code}
          href={`/states/${state.slug}`}
          className="group relative rounded-xl overflow-hidden border hover:shadow-md transition-all duration-200"
        >
          <div className="aspect-[3/2] relative">
            <Image
              src={`https://flagcdn.com/w320/us-${state.code.toLowerCase()}.png`}
              alt={`${state.name} state flag`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <p className="text-white font-semibold text-sm drop-shadow-sm">
                {state.name}
              </p>
              <p className="text-white/80 text-xs">
                {state.boatCount} {state.boatCount === 1 ? "boat" : "boats"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
