import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Fish, MapPin, Tag, Calendar, Ruler, Waves, Zap, UtensilsCrossed } from "lucide-react";
import { BoatCard } from "@/components/boat-card";
import { getBoatsBySpecies, getStatesForSpecies, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBoatsBySpecies(slug);
  if (!data) return { title: "Species Not Found" };

  const sp = data.species;
  const title = `${sp.name} Fishing - Party Boat Charters | PartyBoatsUSA`;
  const desc = sp.descriptionLong
    ? sp.descriptionLong.slice(0, 155).replace(/\n/g, " ").trim() + "..."
    : sp.description
    ? sp.description.slice(0, 155)
    : `Find ${data.total} party boat fishing charters targeting ${sp.name} across the USA. Compare prices, read reviews, and book your trip.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/species/${slug}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/species/${slug}`, type: "website" },
  };
}

export default async function SpeciesDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const data = await getBoatsBySpecies(slug, currentPage, 50);
  if (!data) notFound();

  const { species: sp, aliases } = data;
  const [tierBadges, statesList] = await Promise.all([
    getTierBadgesForBoats(data.boats.map((b) => b.operatorId)),
    getStatesForSpecies(slug),
  ]);

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
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
            <span className="text-foreground font-medium">{sp.name}</span>
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
              {sp.name} Fishing Charters
            </h1>
            {sp.scientificName && (
              <p className="text-blue-200 italic text-sm mb-3">{sp.scientificName}</p>
            )}
            <p className="text-blue-100 max-w-2xl mx-auto">
              Browse {data.total} party boat charters targeting {sp.name} across the United States.
            </p>
          </div>
        </div>
      </section>

      {/* Species Info Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            {/* Quick Facts + Intro Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-4">
                {sp.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">{sp.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {sp.categoryName && sp.categorySlug && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Fish className="h-4 w-4" />
                      <span>Category: <Link href={`/species/category/${sp.categorySlug}`} className="font-medium text-foreground hover:text-primary">{sp.categoryName}</Link></span>
                    </div>
                  )}
                  {aliases.length > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Also known as: <span className="font-medium text-foreground">{aliases.join(", ")}</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Facts Sidebar */}
              {(sp.seasonInfo || sp.sizeRange || sp.habitat || sp.fightRating || sp.edibility) && (
                <div className="bg-gray-50 rounded-xl border p-5 space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Quick Facts</h3>
                  {sp.seasonInfo && (
                    <div className="flex items-start gap-2.5">
                      <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Season</p>
                        <p className="text-sm font-medium">{sp.seasonInfo}</p>
                      </div>
                    </div>
                  )}
                  {sp.sizeRange && (
                    <div className="flex items-start gap-2.5">
                      <Ruler className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Size Range</p>
                        <p className="text-sm font-medium">{sp.sizeRange}</p>
                      </div>
                    </div>
                  )}
                  {sp.habitat && (
                    <div className="flex items-start gap-2.5">
                      <Waves className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Habitat</p>
                        <p className="text-sm font-medium">{sp.habitat}</p>
                      </div>
                    </div>
                  )}
                  {sp.fightRating && (
                    <div className="flex items-start gap-2.5">
                      <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Fight</p>
                        <p className="text-sm font-medium">{sp.fightRating}</p>
                      </div>
                    </div>
                  )}
                  {sp.edibility && (
                    <div className="flex items-start gap-2.5">
                      <UtensilsCrossed className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Table Fare</p>
                        <p className="text-sm font-medium">{sp.edibility}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Long Description */}
            {sp.descriptionLong && (
              <div className="mt-8 prose prose-sm max-w-none text-foreground">
                {sp.descriptionLong.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Boat Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-bold mb-6">
          Boats Targeting {sp.name}
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
                    href={`/species/${slug}?page=${currentPage - 1}`}
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
                    href={`/species/${slug}?page=${currentPage + 1}`}
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
              No boats targeting {sp.name} listed yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Browse by State */}
      {statesList.length > 0 && (
        <section className="bg-gray-50 border-t">
          <div className="container mx-auto px-4 py-10">
            <h2 className="text-xl font-display font-bold mb-4">
              {sp.name} Fishing by State
            </h2>
            <div className="flex flex-wrap gap-2">
              {statesList.map((s) => (
                <Link
                  key={s.stateSlug}
                  href={`/species/${slug}/${s.stateSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  {s.stateName}
                  <span className="text-muted-foreground">({s.boatCount})</span>
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
              ...(sp.categorySlug ? [{ "@type": "ListItem", position: 3, name: sp.categoryName, item: `${SITE_URL}/species/category/${sp.categorySlug}` }] : []),
              { "@type": "ListItem", position: sp.categorySlug ? 4 : 3, name: sp.name, item: `${SITE_URL}/species/${slug}` },
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
              name: `${sp.name} Fishing Charters`,
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
