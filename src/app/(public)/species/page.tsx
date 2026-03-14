import Link from "next/link";
import { ChevronRight, Fish } from "lucide-react";
import { getAllSpeciesWithBoatCounts } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fish Species - Party Boat Fishing Targets",
  description:
    "Browse party boat fishing charters by target species. Find boats targeting snapper, grouper, tuna, mahi-mahi, and more across the USA.",
  alternates: { canonical: "/species" },
};

export default async function SpeciesPage() {
  const species = await getAllSpeciesWithBoatCounts();

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Fish Species</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            Browse by Fish Species
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Find party boat fishing charters by the species you want to target.
            From inshore favorites to offshore game fish.
          </p>
        </div>
      </section>

      {/* Species Grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((sp) => (
            <Link
              key={sp.slug}
              href={`/species/${sp.slug}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Fish className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                  {sp.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sp.boatCount} {sp.boatCount === 1 ? "boat" : "boats"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Fish Species", item: `${SITE_URL}/species` },
            ],
          }),
        }}
      />
    </>
  );
}
