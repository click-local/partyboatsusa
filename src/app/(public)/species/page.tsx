import Link from "next/link";
import { ChevronRight, Fish, Search } from "lucide-react";
import { getAllSpeciesWithBoatCounts, getAllSpeciesCategories } from "@/lib/db/queries/boats";
import { SpeciesIndexClient } from "./species-index-client";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fish Species - Party Boat Fishing Targets | PartyBoatsUSA",
  description:
    "Browse party boat fishing charters by target species. Find boats targeting snapper, grouper, tuna, mahi-mahi, and more across the USA.",
  alternates: { canonical: "/species" },
  openGraph: {
    title: "Fish Species - Party Boat Fishing Targets | PartyBoatsUSA",
    description: "Browse party boat fishing charters by target species. Find boats targeting snapper, grouper, tuna, mahi-mahi, and more across the USA.",
    url: `${SITE_URL}/species`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fish Species - Party Boat Fishing Targets | PartyBoatsUSA",
    description: "Browse party boat fishing charters by target species. Find boats targeting snapper, grouper, tuna, mahi-mahi, and more across the USA.",
  },
};

export default async function SpeciesPage() {
  const [speciesList, categories] = await Promise.all([
    getAllSpeciesWithBoatCounts(),
    getAllSpeciesCategories(),
  ]);

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
            From inshore favorites to offshore game fish, we have {speciesList.length} species listed.
          </p>
        </div>
      </section>

      {/* Species Grid with Client-Side Search */}
      <SpeciesIndexClient species={speciesList} categories={categories} />

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
