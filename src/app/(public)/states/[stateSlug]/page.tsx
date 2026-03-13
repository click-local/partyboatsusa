import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { BoatCard } from "@/components/boat-card";
import { getStateBySlug, getCitiesByState } from "@/lib/db/queries/states";
import { getBoatsByState } from "@/lib/db/queries/boats";
import { getDestinationPageByStateSlug } from "@/lib/db/queries/destination-pages";
import { formatImageUrl } from "@/lib/utils";
import { ContentBlockRenderer } from "@/components/content-blocks";
import { StateBoatsMap } from "@/components/map/state-boats-map";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ stateSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug } = await params;
  const destPage = await getDestinationPageByStateSlug(stateSlug);
  if (!destPage) {
    const state = await getStateBySlug(stateSlug);
    if (!state) return { title: "State Not Found" };
    const desc = `Find the best party boat fishing charters in ${state.name}. Browse boats, compare prices, and book your trip.`;
    return {
      title: `Party Boat Fishing in ${state.name}`,
      description: desc,
      twitter: { card: "summary_large_image", description: desc },
      alternates: { canonical: `/states/${stateSlug}` },
    };
  }

  const title = destPage.seoTitle || `Party Boat Fishing in ${destPage.state.name}`;
  const desc = destPage.seoDescription || `Find the best party boat fishing charters in ${destPage.state.name}.`;
  const image = destPage.heroImageUrl ? formatImageUrl(destPage.heroImageUrl) : undefined;

  return {
    title,
    description: desc,
    openGraph: {
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `/states/${stateSlug}` },
  };
}

export default async function StatePage({ params }: Props) {
  const { stateSlug } = await params;
  const state = await getStateBySlug(stateSlug);
  if (!state) notFound();

  const [destPage, boatData, cities] = await Promise.all([
    getDestinationPageByStateSlug(stateSlug),
    getBoatsByState(state.code, 1, 50),
    getCitiesByState(state.code),
  ]);

  const heroImage = destPage?.heroImageUrl;

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/destinations" className="hover:text-primary">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{state.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero — Google Map with boat markers */}
      {(() => {
        const mappableBoats = boatData.boats
          .filter((b) => b.latitude && b.longitude)
          .map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            latitude: Number(b.latitude),
            longitude: Number(b.longitude),
            cityName: b.cityName,
          }));

        if (mappableBoats.length > 0) {
          const avgLat = mappableBoats.reduce((s, b) => s + b.latitude, 0) / mappableBoats.length;
          const avgLng = mappableBoats.reduce((s, b) => s + b.longitude, 0) / mappableBoats.length;

          return (
            <StateBoatsMap
              boats={mappableBoats}
              center={{ lat: avgLat, lng: avgLng }}
              className="w-full h-[350px] md:h-[450px]"
            />
          );
        }

        // Fallback hero if no boats have coordinates
        return (
          <section className="relative bg-primary text-white py-16">
            {heroImage && (
              <Image
                src={formatImageUrl(heroImage)}
                alt={`Fishing in ${state.name}`}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-primary/70" />
            <div className="relative container mx-auto px-4 text-center">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
                {destPage?.heroHeadline || `Party Boat Fishing in ${state.name}`}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                {destPage?.heroSubheadline ||
                  `Discover ${boatData.total} party boat charters in ${state.name}`}
              </p>
            </div>
          </section>
        );
      })()}

      <div className="container mx-auto px-4 py-12">
        {/* Popular Cities — always at top */}
        {cities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-4">
              Popular Cities in {state.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <LinkButton key={city.id} href={`/locations/${city.slug}`} variant="outline" size="sm" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {city.name}
                </LinkButton>
              ))}
            </div>
          </section>
        )}

        {/* Content Blocks (boats blocks render inline with boat data) */}
        {destPage?.blocks && destPage.blocks.length > 0 && (
          <div className="mb-12 space-y-8">
            {destPage.blocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                boats={block.blockType === "boats" ? boatData.boats : undefined}
              />
            ))}
          </div>
        )}

        {/* Boat Listings — only show if no "boats" content block handles it */}
        {(!destPage?.blocks || !destPage.blocks.some((b) => b.blockType === "boats")) && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">
              Party Boats in {state.name}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({boatData.total})
              </span>
            </h2>

            {boatData.boats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boatData.boats.map((boat) => (
                  <BoatCard key={boat.id} boat={boat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No party boats listed in {state.name} yet. Check back soon!
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
              { "@type": "ListItem", position: 3, name: state.name, item: `${SITE_URL}/states/${stateSlug}` },
            ],
          }),
        }}
      />
    </>
  );
}
