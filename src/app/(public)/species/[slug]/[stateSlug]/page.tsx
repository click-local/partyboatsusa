import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Fish, MapPin, Tag, Calendar, Anchor, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoatCard } from "@/components/boat-card";
import { SpeciesBoatExplorer } from "@/components/species-boat-explorer";
import { getBoatsBySpeciesAndState, getAllSpeciesStateCombinations, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import { getBragBoardPhotosBySpecies } from "@/lib/db/queries/brag-board";
import { getSpeciesStateSeasons } from "@/lib/db/queries/seasons";
import { FishingSeasonCalendar } from "@/components/fishing-season-calendar";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";
const GRID_PAGE_SIZE = 9;

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
  const stContent = data.stateContent;
  const desc = stContent?.content
    ? stContent.content.slice(0, 155).trim() + "..."
    : `Find ${data.total} party boat fishing charters targeting ${sp.name} in ${st.name}. Compare prices, read reviews, and book your ${sp.name} fishing trip today.`;

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

  // Fetch all boats for map markers; paginate the grid display
  const data = await getBoatsBySpeciesAndState(slug, stateSlug, 1, 500);
  if (!data) notFound();

  const { species: sp, state: st, stateContent, aliases, otherStates } = data;
  const [tierBadges, bragPhotos, seasonData] = await Promise.all([
    getTierBadgesForBoats(data.boats.map((b) => b.operatorId)),
    getBragBoardPhotosBySpecies(sp.id, 8),
    getSpeciesStateSeasons(sp.id, st.code),
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
                {sp.name} Fishing in {st.name}
              </h1>
              {sp.scientificName && (
                <p className="text-blue-200 italic text-sm">{sp.scientificName}</p>
              )}
              <p className="text-blue-100 text-sm mt-1">
                {data.total} party boat charter{data.total !== 1 ? "s" : ""} in {st.name}
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
        stateCode={st.code}
        stateName={st.name}
        stateSlug={stateSlug}
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

      {/* Fishing Season Calendar - hidden until Fish Rules API integration verifies accuracy */}
      {/* <FishingSeasonCalendar
        speciesName={sp.name}
        stateName={st.name}
        regionSeasons={seasonData}
      /> */}

      {/* About Section - SEO Content */}
      {(stateContent?.content || sp.description || stateContent?.bestSeason || stateContent?.popularPorts) && (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold">
                About {sp.name} Fishing in {st.name}
              </h2>

              {stateContent?.content ? (
                stateContent.content.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p>
                ))
              ) : sp.description ? (
                <p className="text-muted-foreground leading-relaxed">{sp.description}</p>
              ) : null}

              {/* Quick info pills */}
              <div className="flex flex-wrap gap-3">
                {stateContent?.bestSeason && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Best Season: {stateContent.bestSeason}</span>
                  </div>
                )}
                {stateContent?.popularPorts && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm">
                    <Anchor className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-800 font-medium">Ports: {stateContent.popularPorts}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>State: <Link href={`/states/${stateSlug}`} className="font-medium text-foreground hover:text-primary">{st.name}</Link></span>
                </div>
                {sp.categoryName && sp.categorySlug && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Fish className="h-4 w-4" />
                    <span>Species: <Link href={`/species/${slug}`} className="font-medium text-foreground hover:text-primary">{sp.name}</Link></span>
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
          </div>
        </section>
      )}

      {/* Other States + All Boats */}
      <div id="all-boats" className="container mx-auto px-4 py-12">
        {/* Other States */}
        {otherStates.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-display font-bold mb-4">
              {sp.name} Fishing in Other States
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {otherStates.map((os) => (
                <Link
                  key={os.stateCode}
                  href={`/species/${slug}/${os.stateSlug}`}
                  className="group relative rounded-lg overflow-hidden border hover:shadow-md transition-all"
                >
                  <div className="aspect-[3/2] relative">
                    <Image
                      src={`https://flagcdn.com/w160/us-${os.stateCode.toLowerCase()}.png`}
                      alt={`${os.stateName} flag`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-2">
                      <p className="text-white font-semibold text-xs drop-shadow-sm truncate">
                        {os.stateName}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Boats Grid */}
        <h2 className="text-2xl font-display font-bold mb-6">
          All {sp.name} Charters in {st.name}
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
                    href={`/species/${slug}/${stateSlug}?page=${currentPage - 1}#all-boats`}
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
                    href={`/species/${slug}/${stateSlug}?page=${currentPage + 1}#all-boats`}
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
