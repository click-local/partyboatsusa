import { Calendar, Flame, Ban } from "lucide-react";
import type { MonthSeason, SeasonRating, RegionSeasons } from "@/lib/db/queries/seasons";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const RIBBON_COLORS: Record<SeasonRating, { bg: string; text: string }> = {
  peak: { bg: "bg-emerald-500", text: "text-white" },
  good: { bg: "bg-sky-500", text: "text-white" },
  fair: { bg: "bg-amber-400", text: "text-amber-950" },
  off: { bg: "bg-gray-200", text: "text-gray-500" },
  closed: { bg: "bg-red-500", text: "text-white" },
};

const LEGEND: { rating: SeasonRating; label: string; dot: string }[] = [
  { rating: "peak", label: "Peak", dot: "bg-emerald-500" },
  { rating: "good", label: "Good", dot: "bg-sky-500" },
  { rating: "fair", label: "Fair", dot: "bg-amber-400" },
  { rating: "off", label: "Off Season", dot: "bg-gray-200" },
  { rating: "closed", label: "Closed", dot: "bg-red-500" },
];

interface FishingSeasonCalendarProps {
  speciesName: string;
  stateName: string;
  regionSeasons: RegionSeasons[];
}

export function FishingSeasonCalendar({
  speciesName,
  stateName,
  regionSeasons,
}: FishingSeasonCalendarProps) {
  if (regionSeasons.length === 0) return null;

  const currentMonth = new Date().getMonth() + 1;
  const hasMultipleRegions = regionSeasons.length > 1;

  // Only include legend items for ratings that are actually used
  const usedRatings = new Set<SeasonRating>();
  for (const rs of regionSeasons) {
    for (const m of rs.months) {
      usedRatings.add(m.rating);
    }
  }
  const activeLegend = LEGEND.filter((l) => usedRatings.has(l.rating));

  return (
    <section className="bg-gray-50 border-b">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-1">
          <Calendar className="h-5 w-5 text-primary" />
          When to Fish {speciesName} in {stateName}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Recreational fishing season guide
        </p>

        <div className="space-y-4">
          {regionSeasons.map((rs, regionIdx) => (
            <SeasonRibbon
              key={rs.region ?? "default"}
              seasons={rs.months}
              regionLabel={hasMultipleRegions ? rs.region : null}
              currentMonth={currentMonth}
              activeLegend={activeLegend}
              showLegend={regionIdx === regionSeasons.length - 1}
            />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground mt-4">
          Season dates are based on current recreational regulations and are subject to change.
          Always verify with your state fish and wildlife agency before your trip.
        </p>
      </div>
    </section>
  );
}

// ---- Season Ribbon Sub-component ----

interface SeasonRibbonProps {
  seasons: MonthSeason[];
  regionLabel: string | null;
  currentMonth: number;
  activeLegend: typeof LEGEND;
  showLegend: boolean;
}

function SeasonRibbon({
  seasons,
  regionLabel,
  currentMonth,
  activeLegend,
  showLegend,
}: SeasonRibbonProps) {
  // Group consecutive peak/good months for highlight callouts
  const highlights: { months: string; notes: string; rating: SeasonRating }[] = [];
  let run: MonthSeason[] = [];

  for (const s of seasons) {
    if (s.rating === "peak" || s.rating === "good") {
      run.push(s);
    } else {
      if (run.length > 0) {
        flushRun(run, highlights);
        run = [];
      }
    }
  }
  if (run.length > 0) flushRun(run, highlights);

  return (
    <div>
      {regionLabel && (
        <p className="text-sm font-semibold text-muted-foreground mb-2 ml-1">
          {regionLabel}
        </p>
      )}
      <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5">
        {/* The ribbon */}
        <div className="grid grid-cols-6 lg:grid-cols-12 gap-0">
          {seasons.map((season, i) => {
            const colors = RIBBON_COLORS[season.rating];
            const isCurrent = season.month === currentMonth;
            const isFirst = i === 0;
            const isLast = i === seasons.length - 1;
            const mobileRowStart = i === 0 || i === 6;
            const mobileRowEnd = i === 5 || i === 11;

            return (
              <div key={season.month} className="flex flex-col items-center">
                {/* Current month indicator */}
                <div className="h-4 flex items-end justify-center mb-1">
                  {isCurrent && (
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-primary" />
                  )}
                </div>

                {/* Color cell */}
                <div
                  className={`
                    w-full h-10 sm:h-12 flex items-center justify-center relative
                    ${colors.bg} ${colors.text}
                    ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                    ${isFirst ? "rounded-l-full" : ""}
                    ${isLast ? "rounded-r-full" : ""}
                    ${mobileRowStart && !isFirst ? "rounded-l-full lg:rounded-l-none" : ""}
                    ${mobileRowEnd && !isLast ? "rounded-r-full lg:rounded-r-none" : ""}
                    transition-all
                  `}
                >
                  <span className="text-xs font-bold tracking-wide">
                    {MONTH_LABELS[season.month - 1]}
                  </span>
                </div>

                {/* "Now" label */}
                <div className="h-5 flex items-start justify-center mt-1">
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Now
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend - only shown on the last ribbon */}
        {showLegend && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-2">
            {activeLegend.map((l) => (
              <div key={l.rating} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${l.dot}`} />
                <span className="text-xs text-muted-foreground font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Season Highlights */}
      {highlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 shadow-sm"
            >
              <Flame className={`h-4 w-4 shrink-0 ${h.rating === "peak" ? "text-emerald-500" : "text-sky-500"}`} />
              <div>
                <p className="text-sm font-semibold">
                  {h.rating === "peak" ? "Peak" : "Good"}: {h.months}
                </p>
                <p className="text-xs text-muted-foreground">{h.notes}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Helpers ----

function flushRun(
  run: MonthSeason[],
  highlights: { months: string; notes: string; rating: SeasonRating }[]
) {
  const peakMonths = run.filter((s) => s.rating === "peak");
  const goodMonths = run.filter((s) => s.rating === "good");

  if (peakMonths.length > 0) {
    const months = formatMonthRange(peakMonths);
    const notes = peakMonths[0].notes || "";
    highlights.push({ months, notes, rating: "peak" });
  }
  if (goodMonths.length > 0) {
    const months = formatMonthRange(goodMonths);
    const notes = goodMonths[0].notes || "";
    highlights.push({ months, notes, rating: "good" });
  }
}

function formatMonthRange(months: MonthSeason[]): string {
  if (months.length === 1) return MONTH_LABELS[months[0].month - 1];
  return `${MONTH_LABELS[months[0].month - 1]} - ${MONTH_LABELS[months[months.length - 1].month - 1]}`;
}
