import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Fish, MapPin, Tag, Ruler, Waves, Zap, UtensilsCrossed, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoatCard } from "@/components/boat-card";
import { SpeciesBoatExplorer } from "@/components/species-boat-explorer";
import { getBoatsBySpecies, getStatesForSpecies, getTierBadgesForBoats, getAllSpeciesWithBoatCounts } from "@/lib/db/queries/boats";
import { getBragBoardPhotosBySpecies } from "@/lib/db/queries/brag-board";
import { getTopSpeciesByState } from "@/lib/db/queries/states";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";
const GRID_PAGE_SIZE = 9;

export const revalidate = 1800;

export async function generateStaticParams() {
  const allSpecies = await getAllSpeciesWithBoatCounts();
  return allSpecies.map((sp) => ({ slug: sp.slug }));
}

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
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function SpeciesDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  // Fetch all boats for map markers; paginate the grid display client-side
  const data = await getBoatsBySpecies(slug, 1, 500);
  if (!data) notFound();

  const { species: sp, aliases } = data;
  const [tierBadges, statesList, bragPhotos, speciesByStateMap] = await Promise.all([
    getTierBadgesForBoats(data.boats.map((b) => b.operatorId)),
    getStatesForSpecies(slug),
    getBragBoardPhotosBySpecies(sp.id, 8),
    getTopSpeciesByState(5),
  ]);

  // Prepare data for the explorer component (all boats for map)
  const allBoatMarkers = data.boats
    .filter((b) => b.latitude && b.longitude)
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      latitude: Number(b.latitude),
      longitude: Number(b.longitude),
      cityName: b.cityName,
    }));

  const fallbackBoats = data.boats.slice(0, 4).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    operatorName: b.operatorName,
    operatorId: b.operatorId,
    cityName: b.cityName,
    stateCode: b.stateCode,
    latitude: b.latitude,
    longitude: b.longitude,
    primaryImageUrl: b.primaryImageUrl,
    imageFocalPointX: b.imageFocalPointX,
    imageFocalPointY: b.imageFocalPointY,
    rating: b.rating,
    reviewCount: b.reviewCount,
    capacity: b.capacity,
    minPricePerPerson: b.minPricePerPerson,
    isFeatured: b.isFeatured,
    isFeaturedAdmin: b.isFeaturedAdmin,
  }));

  const tierBadgesObj: Record<number, { name: string; color: string }> = {};
  tierBadges.forEach((v, k) => { tierBadgesObj[k] = v; });

  // Grid pagination (from the full boats array)
  const totalGridPages = Math.ceil(data.total / GRID_PAGE_SIZE);
  const gridStart = (currentPage - 1) * GRID_PAGE_SIZE;
  const gridBoats = data.boats.slice(gridStart, gridStart + GRID_PAGE_SIZE);

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

      {/* Compact Hero */}
      <section className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {sp.imageUrl && (
              <div className="bg-white/10 backdrop-blur rounded-lg p-2 shrink-0">
                <Image
                  src={sp.imageUrl}
                  alt={sp.name}
                  width={120}
                  height={72}
                  className="h-14 md:h-20 w-auto object-contain drop-shadow-lg"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-3xl font-display font-bold">
                {sp.name} Fishing Charters
              </h1>
              {sp.scientificName && (
                <p className="text-blue-200 italic text-sm">{sp.scientificName}</p>
              )}
              <p className="text-blue-100 text-sm mt-1">
                {data.total} party boat charter{data.total !== 1 ? "s" : ""} across the United States
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Boat Explorer - Map + Nearest Boats (THE FOCUS) */}
      <SpeciesBoatExplorer
        speciesId={sp.id}
        speciesName={sp.name}
        speciesSlug={slug}
        allBoatMarkers={allBoatMarkers}
        fallbackBoats={fallbackBoats}
        tierBadges={tierBadgesObj}
        totalCount={data.total}
      />

      {/* Brag Board - Recent Catches */}
      {bragPhotos.length > 0 && (
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Recent {sp.name} Catches
              </h2>
              <Link
                href="/brag-board"
                className="text-sm text-primary hover:underline font-medium"
              >
                See All Catches
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bragPhotos.map(({ photo, boatName, boatSlug }) => (
                <Card key={photo.id} className="group overflow-hidden pt-0 gap-0">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={formatImageUrl(photo.photoUrl)}
                      alt={photo.catchDescription}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {photo.catchDescription}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{photo.submitterName}</span>
                      <Link
                        href={`/boats/${boatSlug}`}
                        className="text-primary hover:underline truncate ml-2"
                      >
                        {boatName}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About This Species - SEO Content */}
      {(sp.description || sp.descriptionLong || sp.sizeRange || sp.habitat || sp.fightRating || sp.edibility) && (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-10">
              <h2 className="text-xl font-display font-bold mb-6">About {sp.name}</h2>
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
                {(sp.sizeRange || sp.habitat || sp.fightRating || sp.edibility) && (
                  <div className="bg-gray-50 rounded-xl border p-5 space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Quick Facts</h3>
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
        </section>
      )}

      {/* Browse by State + All Boats */}
      <div id="all-boats" className="container mx-auto px-4 py-12">
        {/* Browse by State */}
        {statesList.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-display font-bold mb-4">
              {sp.name} Fishing by State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statesList.map((s) => {
                const topSpecies = speciesByStateMap.get(s.stateCode) || [];
                return (
                  <div
                    key={s.stateSlug}
                    className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/species/${slug}/${s.stateSlug}`}
                      className="group flex items-center gap-4 p-4 pb-3"
                    >
                      <div className="flex-shrink-0 w-14 h-10 rounded overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                          src={`https://flagcdn.com/w160/us-${s.stateCode.toLowerCase()}.png`}
                          alt={`${s.stateName} flag`}
                          width={56}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                          {s.stateName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {s.boatCount} {s.boatCount === 1 ? "charter" : "charters"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                    {topSpecies.length > 0 && (
                      <div className="px-4 pb-4">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                          Popular Species
                        </p>
                        <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
                          {topSpecies.map((tsp) => (
                            <Link
                              key={tsp.slug}
                              href={`/species/${tsp.slug}/${s.stateSlug}`}
                              className="group/sp flex flex-col items-center gap-1.5 flex-shrink-0"
                              title={tsp.name}
                            >
                              {tsp.imageUrl ? (
                                <Image
                                  src={tsp.imageUrl}
                                  alt={tsp.name}
                                  width={72}
                                  height={72}
                                  className="w-[72px] h-[72px] object-contain group-hover/sp:scale-110 transition-transform"
                                />
                              ) : (
                                <Fish className="w-[72px] h-[72px] p-4 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground text-center leading-tight max-w-[80px] group-hover/sp:text-primary transition-colors">
                                {tsp.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Boats Grid */}
        <h2 className="text-2xl font-display font-bold mb-6">
          All {sp.name} Charters
          <span className="text-muted-foreground font-normal text-lg ml-2">
            ({data.total})
          </span>
        </h2>

        {gridBoats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridBoats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} tierBadge={tierBadges.get(boat.operatorId!) || null} />
              ))}
            </div>

            {totalGridPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <Link
                    href={`/species/${slug}?page=${currentPage - 1}#all-boats`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Previous
                  </Link>
                )}
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalGridPages}
                </span>
                {currentPage < totalGridPages && (
                  <Link
                    href={`/species/${slug}?page=${currentPage + 1}#all-boats`}
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
