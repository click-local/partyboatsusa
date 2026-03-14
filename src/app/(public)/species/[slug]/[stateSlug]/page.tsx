import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Fish, MapPin, Tag } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { getBoatsBySpeciesAndState, getAllSpeciesStateCombinations, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string; stateSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const combos = await getAllSpeciesStateCombinations();
  return combos.map((c) => ({ slug: c.speciesSlug, stateSlug: c.stateSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, stateSlug } = await params;
  const data = await getBoatsBySpeciesAndState(slug, stateSlug);
  if (!data) return { title: "Not Found" };

  const { species: sp, state: st } = data;
  const title = `${sp.name} Fishing in ${st.name} - Party Boat Charters | PartyBoatsUSA`;
  const desc = `Find ${data.total} party boat fishing charters targeting ${sp.name} in ${st.name}. Compare prices, read reviews, and book your ${sp.name} fishing trip today.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/species/${slug}/${stateSlug}` },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/species/${slug}/${stateSlug}`,
      type: "website",
      ...(sp.imageUrl ? { images: [{ url: sp.imageUrl, alt: sp.name }] } : {}),
    },
  };
}

export default async function SpeciesStatePage({ params, searchParams }: Props) {
  const { slug, stateSlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const data = await getBoatsBySpeciesAndState(slug, stateSlug, currentPage, 50);
  if (!data) notFound();

  const { species: sp, state: st, aliases, otherStates } = data;
  const tierBadges = await getTierBadgesForBoats(data.boats.map((b) => b.operatorId));

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/species" className="hover:text-primary">Fish Species</Link>
            <ChevronRight className="h-3 w-3" />
            {sp.categoryName && sp.categorySlug && (
              <>
                <Link href={`/species/category/${sp.categorySlug}`} className="hover:text-primary">{sp.categoryName}</Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <Link href={`/species/${slug}`} className="hover:text-primary">{sp.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{st.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {sp.imageUrl && (
              <div className="mb-5 inline-block">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 inline-block">
                  <Image
                    src={sp.imageUrl}
                    alt={sp.name}
                    width={200}
                    height={120}
                    className="h-24 md:h-32 w-auto object-contain drop-shadow-lg"
                  />
                </div>
              </div>
            )}
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
              {sp.name} Fishing in {st.name}
            </h1>
            {sp.scientificName && (
              <p className="text-blue-200 italic text-sm mb-3">{sp.scientificName}</p>
            )}
            <p className="text-blue-100 max-w-2xl mx-auto">
              Browse {data.total} party boat charter{data.total !== 1 ? "s" : ""} targeting {sp.name} in {st.name}.
            </p>
          </div>
        </div>
      </section>

      {/* Species Info Section */}
      {(sp.description || aliases.length > 0 || sp.categoryName) && (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {sp.description && (
                <p className="text-muted-foreground leading-relaxed">{sp.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {sp.categoryName && sp.categorySlug && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Fish className="h-4 w-4" />
                    <span>Category: <Link href={`/species/category/${sp.categorySlug}`} className="font-medium text-foreground hover:text-primary">{sp.categoryName}</Link></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>State: <Link href={`/states/${stateSlug}`} className="font-medium text-foreground hover:text-primary">{st.name}</Link></span>
                </div>
                {aliases.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Also known as: <span className="font-medium text-foreground">{aliases.join(", ")}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Boat Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-bold mb-6">
          {sp.name} Charters in {st.name}
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
                    href={`/species/${slug}/${stateSlug}?page=${currentPage - 1}`}
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
                    href={`/species/${slug}/${stateSlug}?page=${currentPage + 1}`}
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
              No boats targeting {sp.name} in {st.name} listed yet. Check back soon!
            </p>
            <Link href={`/species/${slug}`} className="text-primary hover:underline mt-2 inline-block">
              View all {sp.name} charters nationwide
            </Link>
          </div>
        )}
      </div>

      {/* Other States Section */}
      {otherStates.length > 0 && (
        <section className="bg-gray-50 border-t">
          <div className="container mx-auto px-4 py-10">
            <h2 className="text-xl font-display font-bold mb-4">
              {sp.name} Fishing in Other States
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherStates.map((os) => (
                <Link
                  key={os.stateCode}
                  href={`/species/${slug}/${os.stateSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  {os.stateName}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
              ...(sp.categorySlug
                ? [{ "@type": "ListItem", position: 3, name: sp.categoryName, item: `${SITE_URL}/species/category/${sp.categorySlug}` }]
                : []),
              { "@type": "ListItem", position: sp.categorySlug ? 4 : 3, name: sp.name, item: `${SITE_URL}/species/${slug}` },
              { "@type": "ListItem", position: sp.categorySlug ? 5 : 4, name: st.name, item: `${SITE_URL}/species/${slug}/${stateSlug}` },
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
              name: `${sp.name} Fishing Charters in ${st.name}`,
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
