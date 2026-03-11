import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getStatesWithListings } from "@/lib/db/queries/states";
import { getBoatCountsByState } from "@/lib/db/queries/boats";
import { getAllDestinationPages } from "@/lib/db/queries/destination-pages";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Destinations",
  description:
    "Explore party boat fishing destinations across the United States. Find charters by state and city.",
};

export default async function DestinationsPage() {
  const [statesWithListings, boatCounts, destinationPages] = await Promise.all([
    getStatesWithListings(),
    getBoatCountsByState(),
    getAllDestinationPages(),
  ]);

  const countMap = new Map(
    boatCounts.map((bc) => [bc.stateCode, Number(bc.count)])
  );

  // Match destination pages to states for hero images
  const statePages = new Map(
    destinationPages
      .filter((dp) => dp.type === "state")
      .map((dp) => [dp.referenceId, dp])
  );

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Destinations</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Browse Destinations
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Explore party boat fishing destinations across the United States.
            Select a state to see available charters.
          </p>
        </div>
      </section>

      {/* State Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {statesWithListings.map(({ state }) => {
            const count = countMap.get(state.code) ?? 0;
            const destPage = statePages.get(state.id);
            const imageUrl = destPage?.cardImageUrl || destPage?.heroImageUrl;

            return (
              <Link key={state.code} href={`/states/${state.slug}`}>
                <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-300 h-full">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {imageUrl ? (
                      <Image
                        src={formatImageUrl(imageUrl)}
                        alt={`Fishing in ${state.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <MapPin className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-display font-bold text-xl">{state.name}</h3>
                      <p className="text-sm text-white/80">
                        {count} {count === 1 ? "boat" : "boats"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {statesWithListings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No destinations with active listings yet.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
