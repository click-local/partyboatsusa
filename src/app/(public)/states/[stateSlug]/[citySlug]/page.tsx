import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { ChevronRight, Ship, Fish, DollarSign, Users } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { FeaturedBoatCard } from "@/components/featured-boat-card";
import { ContentBlockRenderer } from "@/components/content-blocks";
import { getCityPageData, getCitiesWithBoats } from "@/lib/db/queries/states";
import { getDestinationPageByCitySlug } from "@/lib/db/queries/destination-pages";
import { getTierBadgesForBoats } from "@/lib/db/queries/boats";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 1800;

export async function generateStaticParams() {
  const citiesWithBoats = await getCitiesWithBoats();
  return citiesWithBoats.map((c) => ({
    stateSlug: c.stateSlug,
    citySlug: c.citySlug,
  }));
}

interface Props {
  params: Promise<{ stateSlug: string; citySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;

  const [data, destPage] = await Promise.all([
    getCityPageData(stateSlug, citySlug),
    getDestinationPageByCitySlug(stateSlug, citySlug),
  ]);

  if (!data) return { title: "Not Found" };
  const { city, state, total, species, priceRange } = data;

  // Custom SEO from destination page takes priority
  const title = destPage?.seoTitle
    || (priceRange
      ? `Party Boat Fishing in ${city.name}, ${state.name} - ${total} Charter${total !== 1 ? "s" : ""} from $${priceRange.min}/person | Party Boats USA`
      : `Party Boat Fishing in ${city.name}, ${state.name} | Party Boats USA`);

  const desc = destPage?.seoDescription || buildMetaDescription(data);

  return {
    title,
    description: desc,
    alternates: { canonical: `/states/${stateSlug}/${citySlug}` },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/states/${stateSlug}/${citySlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

function buildMetaDescription(data: NonNullable<Awaited<ReturnType<typeof getCityPageData>>>) {
  const { city, state, total, species, priceRange } = data;
  const parts: string[] = [];

  parts.push(`Find ${total} party boat fishing charter${total !== 1 ? "s" : ""} in ${city.name}, ${state.name}.`);

  if (species.length > 0) {
    const topNames = species.slice(0, 3).map((s) => s.name);
    parts.push(`Target ${topNames.join(", ")} and more.`);
  }

  if (priceRange) {
    parts.push(`Trips from $${priceRange.min}/person.`);
  }

  parts.push("Compare prices, read reviews, and book today.");

  const desc = parts.join(" ");
  return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
}

export default async function CityPage({ params, searchParams }: Props) {
  const { stateSlug, citySlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [data, destPage] = await Promise.all([
    getCityPageData(stateSlug, citySlug, currentPage, 50),
    getDestinationPageByCitySlug(stateSlug, citySlug),
  ]);

  if (!data || data.total === 0) notFound();

  const {
    state, city, boats: boatList, total, totalPages,
    species: citySpecies,
    priceRange, capacityRange, ratingStats, nearbyCities,
  } = data;

  const tierBadges = await getTierBadgesForBoats(boatList.map((b) => b.operatorId));
  const hasCustomContent = destPage && destPage.blocks.length > 0;

  // Compute avg lat/lng for JSON-LD
  const boatsWithCoords = boatList.filter((b) => b.latitude && b.longitude);
  const avgLat = boatsWithCoords.length > 0
    ? boatsWithCoords.reduce((sum, b) => sum + Number(b.latitude), 0) / boatsWithCoords.length
    : null;
  const avgLng = boatsWithCoords.length > 0
    ? boatsWithCoords.reduce((sum, b) => sum + Number(b.longitude), 0) / boatsWithCoords.length
    : null;

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/destinations" className="hover:text-primary">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/states/${stateSlug}`} className="hover:text-primary">{state.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      {destPage?.heroImageUrl ? (
        <section className="relative bg-gray-900 text-white">
          <Image
            src={formatImageUrl(destPage.heroImageUrl)}
            alt={`Party boat fishing in ${city.name}, ${state.name}`}
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="relative container mx-auto px-4 py-16">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              {destPage.heroHeadline || `Party Boat Fishing in ${city.name}, ${state.name}`}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              {destPage.heroSubheadline || `${total} party boat charter${total !== 1 ? "s" : ""} departing from ${city.name}`}
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-primary text-white py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
              Party Boat Fishing in {city.name}, {state.name}
            </h1>
            <p className="text-blue-100 max-w-2xl mb-5">
              {total} party boat fishing charter{total !== 1 ? "s" : ""} departing from {city.name}.
              Compare prices, read reviews, and book your fishing trip today.
            </p>
            {/* Quick stats */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <Ship className="h-4 w-4" /> {total} Boat{total !== 1 ? "s" : ""}
              </span>
              {citySpecies.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                  <Fish className="h-4 w-4" /> {citySpecies.length} Species
                </span>
              )}
              {priceRange && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                  <DollarSign className="h-4 w-4" /> From ${priceRange.min}/person
                </span>
              )}
              {capacityRange && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                  <Users className="h-4 w-4" /> Up to {capacityRange.max} guests
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Custom Content Blocks (from destination pages admin) */}
        {hasCustomContent && (
          <section className="mb-12">
            {destPage.blocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                boats={boatList}
                tierBadges={tierBadges}
              />
            ))}
          </section>
        )}

        {/* Boat Listings */}
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">
            Party Boats in {city.name}
            <span className="text-muted-foreground font-normal text-lg ml-2">({total})</span>
          </h2>

          {total <= 2 ? (
            <div className="space-y-6">
              {boatList.map((boat) => (
                <FeaturedBoatCard
                  key={boat.id}
                  boat={boat}
                  tierBadge={tierBadges.get(boat.operatorId!) || null}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boatList.map((boat) => (
                <BoatCard
                  key={boat.id}
                  boat={boat}
                  tierBadge={tierBadges.get(boat.operatorId!) || null}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {currentPage > 1 && (
                <Link
                  href={`/states/${stateSlug}/${citySlug}?page=${currentPage - 1}`}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" /> Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/states/${stateSlug}/${citySlug}?page=${currentPage + 1}`}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Fish Species Section */}
        {citySpecies.length > 0 && (
          <section className="mt-14 pt-10 border-t">
            <h2 className="text-2xl font-display font-bold mb-6">
              Fish Species in {city.name}, {state.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {citySpecies.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/species/${sp.slug}`}
                  className="group bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {sp.imageUrl ? (
                      <Image
                        src={formatImageUrl(sp.imageUrl)}
                        alt={sp.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Fish className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {sp.name}
                    </h3>
                    {sp.fightRating && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Fight: {sp.fightRating}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Auto-generated About section (skipped if custom content blocks exist) */}
        {!hasCustomContent && (
          <section className="mt-14 pt-10 border-t">
            <h2 className="text-2xl font-display font-bold mb-4">
              About Fishing in {city.name}, {state.name}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p>{buildAboutText(data)}</p>
            </div>
          </section>
        )}

        {/* Nearby Fishing Ports */}
        {nearbyCities.length > 0 && (
          <section className="mt-14 pt-10 border-t">
            <h2 className="text-xl font-display font-bold mb-5">
              Other Fishing Ports in {state.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {nearbyCities.map((nc) => (
                <Link
                  key={nc.citySlug}
                  href={`/states/${stateSlug}/${nc.citySlug}`}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  {nc.cityName} ({nc.boatCount})
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to State */}
        <div className="mt-10">
          <Link
            href={`/states/${stateSlug}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            View all party boats in {state.name}
          </Link>
        </div>
      </div>

      {/* BreadcrumbList JSON-LD */}
      <Script
        id="city-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
              { "@type": "ListItem", position: 3, name: state.name, item: `${SITE_URL}/states/${stateSlug}` },
              { "@type": "ListItem", position: 4, name: city.name, item: `${SITE_URL}/states/${stateSlug}/${citySlug}` },
            ],
          }),
        }}
      />

      {/* ItemList JSON-LD */}
      <Script
        id="city-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Party Boats in ${city.name}, ${state.name}`,
            numberOfItems: total,
            itemListElement: boatList.map((boat, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/boats/${boat.slug}`,
              name: boat.name,
            })),
          }),
        }}
      />

      {/* TouristDestination JSON-LD */}
      <Script
        id="city-destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: `Party Boat Fishing in ${city.name}, ${state.name}`,
            description: buildMetaDescription(data),
            url: `${SITE_URL}/states/${stateSlug}/${citySlug}`,
            touristType: "Fishing",
            ...(avgLat && avgLng
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: avgLat,
                    longitude: avgLng,
                  },
                }
              : {}),
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: state.name,
              url: `${SITE_URL}/states/${stateSlug}`,
            },
          }),
        }}
      />

      {/* AggregateOffer JSON-LD */}
      {priceRange && (
        <Script
          id="city-offer-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AggregateOffer",
              lowPrice: priceRange.min,
              highPrice: priceRange.max,
              priceCurrency: "USD",
              offerCount: total,
              name: `Party Boat Fishing Charters in ${city.name}, ${state.name}`,
            }),
          }}
        />
      )}
    </>
  );
}

function buildAboutText(data: NonNullable<Awaited<ReturnType<typeof getCityPageData>>>) {
  const { city, state, total, species, priceRange, ratingStats } = data;
  const parts: string[] = [];

  parts.push(
    `${city.name}, ${state.name} is home to ${total} party boat fishing charter${total !== 1 ? "s" : ""}.`
  );

  if (species.length > 0) {
    const topSpecies = species.slice(0, 4).map((s) => s.name);
    if (species.length > 4) {
      parts.push(
        `Popular species targeted by local charters include ${topSpecies.join(", ")}, and ${species.length - 4} more.`
      );
    } else {
      parts.push(
        `Popular species targeted by local charters include ${topSpecies.join(" and ")}.`
      );
    }
  }

  if (priceRange) {
    if (priceRange.min === priceRange.max) {
      parts.push(`Trips start at $${priceRange.min} per person.`);
    } else {
      parts.push(`Prices range from $${priceRange.min} to $${priceRange.max} per person.`);
    }
  }

  if (ratingStats.totalReviews > 0) {
    parts.push(
      `Local boats have received ${ratingStats.totalReviews} review${ratingStats.totalReviews !== 1 ? "s" : ""}${ratingStats.avg > 0 ? ` with an average rating of ${ratingStats.avg.toFixed(1)} out of 5` : ""}.`
    );
  }

  return parts.join(" ");
}
