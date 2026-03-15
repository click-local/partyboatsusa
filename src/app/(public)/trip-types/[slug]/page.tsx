import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { getBoatsByTripType, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 1800;

export async function generateStaticParams() {
  const { getAllTripTypesWithBoatCounts } = await import("@/lib/db/queries/boats");
  const tripTypes = await getAllTripTypesWithBoatCounts();
  return tripTypes.map((tt) => ({ slug: tt.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBoatsByTripType(slug);
  if (!data) return { title: "Trip Type Not Found" };

  const title = `${data.tripType.name} Party Boat Fishing Trips`;
  const desc = `Browse ${data.total} ${data.tripType.name.toLowerCase()} party boat fishing charters across the USA. Compare prices, read reviews, and find your trip.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/trip-types/${slug}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/trip-types/${slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function TripTypePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const data = await getBoatsByTripType(slug, currentPage, 50);
  if (!data) notFound();

  const tierBadges = await getTierBadgesForBoats(data.boats.map((b) => b.operatorId));

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/trip-types" className="hover:text-primary">Trip Types</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{data.tripType.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            {data.tripType.name} Fishing Trips
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Browse {data.total} {data.tripType.name.toLowerCase()} party boat
            charters across the United States.
          </p>
        </div>
      </section>

      {/* Boat Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-bold mb-6">
          {data.tripType.name} Boats
          <span className="text-muted-foreground font-normal text-lg ml-2">
            ({data.total})
          </span>
        </h2>

        {data.boats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} tierBadge={tierBadges.get(boat.operatorId!) || null} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <Link
                    href={`/trip-types/${slug}?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Previous
                  </Link>
                )}
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {data.totalPages}
                </span>
                {currentPage < data.totalPages && (
                  <Link
                    href={`/trip-types/${slug}?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No {data.tripType.name.toLowerCase()} boats listed yet. Check back soon!
            </p>
          </div>
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
              { "@type": "ListItem", position: 2, name: "Trip Types", item: `${SITE_URL}/trip-types` },
              { "@type": "ListItem", position: 3, name: data.tripType.name, item: `${SITE_URL}/trip-types/${slug}` },
            ],
          }),
        }}
      />

      {/* ItemList JSON-LD */}
      {data.boats.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${data.tripType.name} Party Boats`,
              numberOfItems: data.total,
              itemListElement: data.boats.map((boat, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/boats/${boat.slug}`,
                name: boat.name,
              })),
            }),
          }}
        />
      )}
    </>
  );
}
