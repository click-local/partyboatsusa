import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Users, DollarSign, Star, Anchor } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { getCityBySlug } from "@/lib/db/queries/states";
import { getDestinationPageByCitySlug } from "@/lib/db/queries/destination-pages";
import { ContentBlockRenderer } from "@/components/content-blocks";
import { formatImageUrl } from "@/lib/utils";
import { db } from "@/lib/db";
import { boats } from "@/lib/db/schema";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import type { Metadata } from "next";

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
    return {
      title: `Party Boat Fishing in ${city.name}`,
      description: `Find party boat fishing charters in ${city.name}. Browse boats, compare prices, and book your trip.`,
    };
  }

  return {
    title: destPage.seoTitle || `Party Boat Fishing in ${destPage.city.name}`,
    description: destPage.seoDescription || `Find the best party boat fishing charters in ${destPage.city.name}.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const [destPage, cityBoats, statsResult] = await Promise.all([
    getDestinationPageByCitySlug(citySlug),
    db
      .select()
      .from(boats)
      .where(and(eq(boats.isPublished, true), ilike(boats.cityName, city.name)))
      .orderBy(desc(boats.rating)),
    db
      .select({
        count: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(${boats.minPricePerPerson}::numeric)`,
        avgCapacity: sql<number>`avg(${boats.capacity})`,
        avgRating: sql<number>`avg(${boats.rating}::numeric)`,
      })
      .from(boats)
      .where(and(eq(boats.isPublished, true), ilike(boats.cityName, city.name))),
  ]);

  const stats = statsResult[0];
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
        {/* Stats Grid */}
        {Number(stats?.count) > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Anchor, label: "Boats", value: stats?.count ?? 0 },
              {
                icon: DollarSign,
                label: "Avg Price",
                value: stats?.avgPrice ? `$${Number(stats.avgPrice).toFixed(0)}` : "N/A",
              },
              {
                icon: Users,
                label: "Avg Capacity",
                value: stats?.avgCapacity ? Math.round(Number(stats.avgCapacity)) : "N/A",
              },
              {
                icon: Star,
                label: "Avg Rating",
                value:
                  Number(stats?.avgRating) > 0
                    ? Number(stats?.avgRating).toFixed(1)
                    : "N/A",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border rounded-lg p-4 text-center"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content Blocks */}
        {destPage?.blocks && destPage.blocks.length > 0 && (
          <div className="mb-12 space-y-8">
            {destPage.blocks.map((block) => (
              <ContentBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Boat Listings */}
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
      </div>
    </>
  );
}
