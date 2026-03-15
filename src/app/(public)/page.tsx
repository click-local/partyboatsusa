import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ArrowRight, Users, Fish } from "lucide-react";
import { db } from "@/lib/db";
import { siteSettings, boats, bragBoardPhotos, destinationPages, states } from "@/lib/db/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
import { getFeaturedBoats, getTierBadgesForBoats, getPopularSpecies } from "@/lib/db/queries/boats";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Party Boats USA - Find the Best Party Boat Fishing Trips in the USA",
  description:
    "Discover and book top-rated headboats and open party fishing charters across the United States. Compare prices, read reviews, and find the perfect fishing trip.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Party Boats USA - Find the Best Party Boat Fishing Trips",
    description:
      "Discover and book top-rated headboats and open party fishing charters across the United States.",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Party Boats USA - Find the Best Party Boat Fishing Trips",
    description:
      "Discover and book top-rated headboats and open party fishing charters across the United States.",
  },
};

export default async function Home() {
  const [settingsRows, featuredBoats, popularSpecies, latestCatches, destPages] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    getFeaturedBoats(9),
    getPopularSpecies(8),
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
      .where(and(eq(bragBoardPhotos.status, "approved"), eq(boats.isPublished, true)))
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
  const tierBadges = await getTierBadgesForBoats(featuredBoats.map((b) => b.operatorId));

  // Resolve state names/slugs for destination pages
  const stateIds = destPages.map((p) => p.referenceId);
  const stateRows = stateIds.length
    ? await db.select().from(states).where(inArray(states.id, stateIds))
    : [];
  const stateMap = new Map(stateRows.map((s) => [s.id, s]));

  return (
    <>
      {/* Hero Section */}
      <section className="relative text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {hero?.heroImageUrl && (
          <Image
            src={hero.heroImageUrl}
            alt="Party boat fishing"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        {/* Bottom gradient only - image stays vivid at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 [text-shadow:_0_2px_12px_rgba(0,0,0,0.7)]">
            {hero?.heroHeadline || "Find the Best Party Boat Fishing Trips in the USA"}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto [text-shadow:_0_1px_8px_rgba(0,0,0,0.6)]">
            {hero?.heroSubheadline || "Discover and book top-rated headboats and open party fishing charters across the United States."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Search className="h-5 w-5" />
              Browse Boats
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-white/15 transition-colors shadow-lg backdrop-blur-sm"
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
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-4">
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
                  <Image
                    src={formatImageUrl(boat.primaryImageUrl)}
                    alt={boat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {boat.isFeatured && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                        Featured
                      </span>
                    )}
                    {tierBadges.get(boat.operatorId!) && (
                      <span
                        className="px-2 py-0.5 text-white text-xs font-semibold rounded"
                        style={{ backgroundColor: tierBadges.get(boat.operatorId!)!.color }}
                      >
                        {tierBadges.get(boat.operatorId!)!.name}
                      </span>
                    )}
                  </div>
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
                <h2 className="text-2xl md:text-3xl font-display font-bold">Latest Catches</h2>
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
                    src={formatImageUrl(photo.photoUrl)}
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

      {/* Popular Target Species */}
      {popularSpecies.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-4">
              Popular Target Species
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              Browse party boat charters by the fish you want to catch
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularSpecies.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/species/${sp.slug}`}
                  className="group flex items-center gap-3 p-4 bg-gray-50 rounded-xl border hover:shadow-md hover:border-primary/30 transition-all"
                >
                  {sp.imageUrl ? (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={sp.imageUrl}
                        alt={sp.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Fish className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {sp.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {sp.boatCount} {sp.boatCount === 1 ? "charter" : "charters"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/species"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                View All Species <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Explore Fishing Destinations */}
      {destPages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-4">
              Explore Fishing Destinations
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              Find party boat fishing trips across the United States
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {destPages.map((page) => {
                const state = stateMap.get(page.referenceId);
                if (!state) return null;
                return (
                  <Link
                    key={page.id}
                    href={`/states/${state.slug}`}
                    className="group flex items-center gap-3 p-3 bg-white rounded-xl border hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-7 rounded overflow-hidden border border-gray-200 shadow-sm">
                      <Image
                        src={`https://flagcdn.com/w80/us-${state.code.toLowerCase()}.png`}
                        alt={`${state.name} flag`}
                        width={40}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {state.name}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
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
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Support",
              url: `${SITE_URL}/contact`,
            },
          }),
        }}
      />
      {/* WebSite + SearchAction JSON-LD (enables sitelinks searchbox) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Party Boats USA",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
