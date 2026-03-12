import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ArrowRight, Users } from "lucide-react";
import { db } from "@/lib/db";
import { siteSettings, boats, bragBoardPhotos, destinationPages, states } from "@/lib/db/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
import { getFeaturedBoats } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [settingsRows, featuredBoats, latestCatches, destPages] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    getFeaturedBoats(9),
    db.select({
      id: bragBoardPhotos.id,
      photoUrl: bragBoardPhotos.photoUrl,
      catchDescription: bragBoardPhotos.catchDescription,
      boatId: bragBoardPhotos.boatId,
      boatName: boats.name,
      boatSlug: boats.slug,
    })
      .from(bragBoardPhotos)
      .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
      .where(eq(bragBoardPhotos.status, "approved"))
      .orderBy(desc(bragBoardPhotos.submittedAt))
      .limit(8),
    db.select({
      id: destinationPages.id,
      type: destinationPages.type,
      referenceId: destinationPages.referenceId,
      heroImageUrl: destinationPages.heroImageUrl,
      cardImageUrl: destinationPages.cardImageUrl,
      heroHeadline: destinationPages.heroHeadline,
    })
      .from(destinationPages)
      .where(and(eq(destinationPages.isPublished, true), eq(destinationPages.type, "state")))
      .orderBy(destinationPages.id),
  ]);

  const hero = settingsRows[0];

  // Resolve state names/slugs for destination pages
  const stateIds = destPages.map((p) => p.referenceId);
  const stateRows = stateIds.length
    ? await db.select().from(states).where(inArray(states.id, stateIds))
    : [];
  const stateMap = new Map(stateRows.map((s) => [s.id, s]));

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 lg:py-32 overflow-hidden">
        {hero?.heroImageUrl && (
          <>
            <Image
              src={hero.heroImageUrl}
              alt="Party boat fishing"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </>
        )}
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
            {hero?.heroHeadline || "Find the Best Party Boat Fishing Trips in the USA"}
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {hero?.heroSubheadline || "Discover and book top-rated headboats and open party fishing charters across the United States."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              Browse Boats
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              <MapPin className="h-5 w-5" />
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Captains & Boats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            Featured Captains &amp; Boats
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Top-rated party boat fishing experiences across the country
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBoats.map((boat) => (
              <Link
                key={boat.id}
                href={`/boats/${boat.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {boat.primaryImageUrl ? (
                    <Image
                      src={boat.primaryImageUrl}
                      alt={boat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{
                        objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  {boat.isFeatured && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                      Featured
                    </span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <span className="text-white text-sm font-medium">
                      {boat.cityName}, {boat.stateCode}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{boat.operatorName}</p>
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                    {boat.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> Up to {boat.capacity} guests
                    </span>
                    {Number(boat.rating) > 0 && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        ★ {Number(boat.rating).toFixed(1)} ({boat.reviewCount})
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-primary font-semibold">
                      From ${Number(boat.minPricePerPerson).toFixed(0)}/person
                    </span>
                    <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse All Boats <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Catches */}
      {latestCatches.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-bold">Latest Catches</h2>
                <p className="text-muted-foreground mt-1">
                  See what anglers are reeling in on party boats across the country
                </p>
              </div>
              <Link
                href="/brag-board"
                className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline"
              >
                View All Photos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestCatches.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/boats/${photo.boatSlug}`}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm"
                >
                  <Image
                    src={photo.photoUrl}
                    alt={photo.catchDescription}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 p-3">
                    <p className="text-white text-sm font-semibold line-clamp-2">
                      {photo.catchDescription}
                    </p>
                    <p className="text-white/80 text-xs mt-1">{photo.boatName}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/brag-board"
                className="text-primary font-medium hover:underline"
              >
                View All Photos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Explore Fishing Destinations */}
      {destPages.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-8">
              Explore Fishing Destinations
            </h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {destPages.map((page) => {
                const state = stateMap.get(page.referenceId);
                if (!state) return null;
                return (
                  <Link
                    key={page.id}
                    href={`/states/${state.slug}`}
                    className="text-primary font-medium hover:text-primary/70 transition-colors"
                  >
                    {state.name}
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                View All Destinations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Party Boats USA",
            url: SITE_URL,
            logo: `${SITE_URL}/opengraph.jpg`,
            description:
              "Discover and book top-rated headboats and open party fishing charters across the United States.",
            sameAs: [],
          }),
        }}
      />
    </>
  );
}
