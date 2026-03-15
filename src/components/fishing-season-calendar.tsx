import { Calendar, Flame } from "lucide-react";
import type { MonthSeason, SeasonRating } from "@/lib/db/queries/seasons";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const RIBBON_COLORS: Record<SeasonRating, { bg: string; text: string }> = {
  peak: { bg: "bg-emerald-500", text: "text-white" },
  good: { bg: "bg-sky-500", text: "text-white" },
  fair: { bg: "bg-amber-400", text: "text-amber-950" },
  off: { bg: "bg-gray-200", text: "text-gray-500" },
};

const LEGEND: { rating: SeasonRating; label: string; dot: string }[] = [
  { rating: "peak", label: "Peak", dot: "bg-emerald-500" },
  { rating: "good", label: "Good", dot: "bg-sky-500" },
  { rating: "fair", label: "Fair", dot: "bg-amber-400" },
  { rating: "off", label: "Off Season", dot: "bg-gray-200" },
];

interface FishingSeasonCalendarProps {
  speciesName: string;
  stateName: string;
  seasons: MonthSeason[];
}

export function FishingSeasonCalendar({
  speciesName,
  stateName,
  seasons,
}: FishingSeasonCalendarProps) {
  if (seasons.length === 0) return null;

  const currentMonth = new Date().getMonth() + 1;

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
    <section className="bg-gray-50 border-b">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-1">
          <Calendar className="h-5 w-5 text-primary" />
          When to Fish {speciesName} in {stateName}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Month-by-month fishing season guide
        </p>

        {/* Season Ribbon - Desktop: single row, Mobile: 2 rows of 6 */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5">
          {/* The ribbon */}
          <div className="grid grid-cols-6 lg:grid-cols-12 gap-0">
            {seasons.map((season, i) => {
              const colors = RIBBON_COLORS[season.rating];
              const isCurrent = season.month === currentMonth;
              const isFirst = i === 0;
              const isLast = i === seasons.length - 1;
              // Row breaks for mobile (6 cols): position 0 and 5 get rounded starts, 5 and 11 get rounded ends
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
                      w-full h-10 sm:h-12 flex items-center justify-center
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

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2">
            {LEGEND.map((l) => (
              <div key={l.rating} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${l.dot}`} />
                <span className="text-xs text-muted-foreground font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Season Highlights */}
        {highlights.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
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
    </section>
  );
}

function flushRun(
  run: MonthSeason[],
  highlights: { months: string; notes: string; rating: SeasonRating }[]
) {
  // Find the best rating in the run
  const hasPeak = run.some((s) => s.rating === "peak");
  const rating: SeasonRating = hasPeak ? "peak" : "good";

  // Group by rating within the run for separate highlight cards
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
