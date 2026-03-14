import Link from "next/link";
import { Ship, MapPin, ChevronRight } from "lucide-react";
import { getAllStatesWithBoatCounts } from "@/lib/db/queries/states";
import { USStatesMap } from "@/components/map/us-states-map";
import { StateListGrid } from "@/components/destinations/state-list-grid";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse Destinations",
  description:
    "Explore party boat fishing destinations across the United States. Find charters by state and city.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const statesData = await getAllStatesWithBoatCounts();

  const mapData = statesData.map((s) => ({
    code: s.code,
    name: s.name,
    slug: s.slug,
    boatCount: Number(s.boatCount),
  }));

  const totalBoats = mapData.reduce((sum, s) => sum + s.boatCount, 0);
  const activeStates = mapData.filter((s) => s.boatCount > 0).length;

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
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Browse Destinations
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            Explore party boat fishing destinations across the United States.
            Click a state to see available charters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-200" />
              <span className="text-lg font-semibold">{totalBoats}</span>
              <span className="text-blue-200">Party Boats</span>
            </div>
            <div className="h-6 w-px bg-blue-300/40" />
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-200" />
              <span className="text-lg font-semibold">{activeStates}</span>
              <span className="text-blue-200">States</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map - desktop only */}
      <section className="hidden md:block bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <USStatesMap states={mapData} />
        </div>
      </section>

      {/* State List */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-display font-bold mb-4 md:mb-6">
          All Destinations
        </h2>
        <StateListGrid states={mapData} />
      </section>

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com" },
              { "@type": "ListItem", position: 2, name: "Destinations", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com"}/destinations` },
            ],
          }),
        }}
      />
    </>
  );
}
