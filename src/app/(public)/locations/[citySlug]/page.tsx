import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { getCityBySlug } from "@/lib/db/queries/states";
import { getDestinationPageByCitySlug } from "@/lib/db/queries/destination-pages";
import { ContentBlockRenderer } from "@/components/content-blocks";
import { formatImageUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { boats } from "@/lib/db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ citySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const destPage = await getDestinationPageByCitySlug(citySlug);
  if (!destPage) {
    const city = await getCityBySlug(citySlug);
    if (!city) return { title: "Location Not Found" };
    const desc = `Find party boat fishing charters in ${city.name}. Browse boats, compare prices, and book your trip.`;
    return {
      title: `Party Boat Fishing in ${city.name}`,
      description: desc,
      twitter: { card: "summary_large_image", description: desc },
      alternates: { canonical: `/locations/${citySlug}` },
    };
  }

  const title = destPage.seoTitle || `Party Boat Fishing in ${destPage.city.name}`;
  const desc = destPage.seoDescription || `Find the best party boat fishing charters in ${destPage.city.name}.`;
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
    alternates: { canonical: `/locations/${citySlug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const [destPage, cityBoats] = await Promise.all([
    getDestinationPageByCitySlug(citySlug),
    db
      .select()
      .from(boats)
      .where(and(eq(boats.isPublished, true), ilike(boats.cityName, city.name)))
      .orderBy(desc(boats.rating)),
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
            <Link href={`/states/${city.stateCode.toLowerCase()}`} className="hover:text-primary">
              {city.stateCode}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-primary text-white py-16">
        {heroImage && (
          <Image
            src={formatImageUrl(heroImage)}
            alt={`Fishing in ${city.name}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
            {destPage?.heroHeadline || `Party Boat Fishing in ${city.name}`}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {destPage?.heroSubheadline ||
              `Discover party boat charters in ${city.name}, ${city.stateCode}`}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Content Blocks (boats blocks render inline with boat data) */}
        {destPage?.blocks && destPage.blocks.length > 0 && (
          <div className="mb-12 space-y-8">
            {destPage.blocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                boats={block.blockType === "boats" ? cityBoats : undefined}
              />
            ))}
          </div>
        )}

        {/* Boat Listings — only show if no "boats" content block handles it */}
        {(!destPage?.blocks || !destPage.blocks.some((b) => b.blockType === "boats")) && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-6">
              Party Boats in {city.name}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({cityBoats.length})
              </span>
            </h2>

            {cityBoats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityBoats.map((boat) => (
                  <BoatCard key={boat.id} boat={boat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No party boats listed in {city.name} yet. Check back soon!
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
              { "@type": "ListItem", position: 3, name: city.stateCode, item: `${SITE_URL}/states/${city.stateCode.toLowerCase()}` },
              { "@type": "ListItem", position: 4, name: city.name, item: `${SITE_URL}/locations/${citySlug}` },
            ],
          }),
        }}
      />
    </>
  );
}
