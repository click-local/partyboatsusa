import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Mail, Star, Users, Anchor, Fish, Clock,
  ChevronRight, ExternalLink, Facebook, Instagram, Youtube, Twitter, Ship, Info,
} from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BoatCard } from "@/components/boat-card";
import { ReviewSection } from "@/components/review-section";
import { getBoatBySlug, getNearbyBoats, getFleetBoats, getTierBadgesForBoats } from "@/lib/db/queries/boats";
import { getReviewsByBoat, getBoatRatingStats } from "@/lib/db/queries/reviews";
import { getBragBoardPhotosByBoat } from "@/lib/db/queries/brag-board";
import { BoatLocationMap } from "@/components/map/boat-location-map";
import { formatImageUrl, formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 1800;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const boat = await getBoatBySlug(slug);
  if (!boat) return { title: "Boat Not Found" };

  const title = boat.seoTitle || `${boat.name} - Party Boat Fishing in ${boat.cityName}, ${boat.stateCode}`;
  const description = boat.seoDescription || boat.descriptionShort || boat.descriptionLong?.slice(0, 160);
  const image = boat.primaryImageUrl ? formatImageUrl(boat.primaryImageUrl) : undefined;

  return {
    title,
    description,
    openGraph: {
      title: boat.name,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: boat.name,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `/boats/${slug}` },
  };
}

export default async function BoatDetailPage({ params }: Props) {
  const { slug } = await params;
  const boat = await getBoatBySlug(slug);
  if (!boat) notFound();

  const isUnclaimed = !boat.operatorId;

  const [reviewData, ratingStats, nearbyBoats, fleetBoats, bragPhotos] = await Promise.all([
    getReviewsByBoat(boat.id),
    getBoatRatingStats(boat.id),
    boat.latitude && boat.longitude
      ? getNearbyBoats(boat.id, boat.latitude, boat.longitude, 6)
      : Promise.resolve([]),
    boat.operatorId
      ? getFleetBoats(boat.operatorId, boat.id)
      : Promise.resolve([]),
    getBragBoardPhotosByBoat(boat.id, 1, 8),
  ]);

  // Filter out fleet boats from nearby boats to avoid duplicates
  const fleetBoatIds = new Set(fleetBoats.map((b) => b.id));
  const filteredNearbyBoats = nearbyBoats.filter((b) => !fleetBoatIds.has(b.id));

  // Fetch tier badges for fleet + nearby boats
  const allRelatedBoats = [...fleetBoats, ...filteredNearbyBoats];
  const tierBadges = await getTierBadgesForBoats(allRelatedBoats.map((b) => b.operatorId));

  const heroImage = formatImageUrl(boat.primaryImageUrl);
  const galleryImages = boat.galleryImageUrls?.filter(Boolean) || [];
  const rating = Number(boat.rating || 0);

  // JSON-LD structured data -LocalBusiness for charter operators
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/boats/${slug}`,
    name: boat.name,
    description: boat.descriptionShort || boat.descriptionLong,
    image: heroImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: boat.cityName,
      addressRegion: boat.stateCode,
      streetAddress: boat.streetAddress,
      postalCode: boat.zipCode,
    },
    geo: boat.latitude && boat.longitude ? {
      "@type": "GeoCoordinates",
      latitude: boat.latitude,
      longitude: boat.longitude,
    } : undefined,
    telephone: boat.phone,
    url: boat.websiteUrl || `${SITE_URL}/boats/${slug}`,
    priceRange: `$${Number(boat.minPricePerPerson).toFixed(0)}-$${Number(boat.maxPricePerPerson).toFixed(0)} per person`,
    aggregateRating: rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: boat.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    review: reviewData.reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.userName },
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : undefined,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      name: r.title,
      reviewBody: r.comment,
    })),
    makesOffer: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(boat.minPricePerPerson).toFixed(2),
      description: `Party boat fishing trip on ${boat.name}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Boats", item: `${SITE_URL}/search` },
      { "@type": "ListItem", position: 3, name: boat.stateName || boat.stateCode, item: `${SITE_URL}/states/${boat.stateSlug || boat.stateCode.toLowerCase()}` },
      { "@type": "ListItem", position: 4, name: boat.name, item: `${SITE_URL}/boats/${slug}` },
    ],
  };

  return (
    <div className="pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/search" className="hover:text-primary">Boats</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/states/${boat.stateSlug || boat.stateCode.toLowerCase()}`} className="hover:text-primary">
              {boat.stateName || boat.stateCode}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate">{boat.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-muted">
        <Image
          src={heroImage}
          alt={boat.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white text-primary hover:bg-white/90 border-none">
                {boat.operatorName}
              </Badge>
              {boat.isFeaturedAdmin && (
                <Badge className="bg-amber-500 text-white">Featured</Badge>
              )}
              {boat.operatorTier?.displayBadge && (
                <Badge
                  style={{ backgroundColor: boat.operatorTier.badgeColor || undefined }}
                  className="text-white"
                >
                  {boat.operatorTier.name}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">{boat.name}</h1>
            <div className="flex items-center gap-4 text-sm mt-2 opacity-90">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {boat.cityName}, {boat.stateCode}
              </span>
              {rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {rating.toFixed(1)} ({boat.reviewCount} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Claim Listing Alert for unclaimed boats */}
        {isUnclaimed && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Ship className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 hidden sm:block" />
              <div>
                <p className="font-semibold text-blue-900 text-sm sm:text-base">Are you the operator of this boat?</p>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Claim this listing to manage your boat&apos;s information and connect with more anglers.
                </p>
              </div>
            </div>
            <Link
              href={`/operator/claim?boatId=${boat.id}&boatName=${encodeURIComponent(boat.name)}`}
              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90 w-full sm:w-auto"
            >
              Claim Your Free Listing
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-2xl font-display font-bold">About the Boat</h2>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border flex items-center gap-2 self-start">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <div className="text-xl font-bold">Up to {boat.capacity}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Passengers</div>
                  </div>
                </div>
              </div>
              {boat.descriptionShort && (
                <p className="text-lg text-muted-foreground mb-4">{boat.descriptionShort}</p>
              )}
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                {boat.descriptionLong}
              </div>
            </div>

            <Separator />

            {/* Trip Types */}
            {boat.tripTypes.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">Trip Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {boat.tripTypes.map((tt) => (
                      <div key={tt.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{tt.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Amenities */}
            {boat.amenities.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {boat.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                          <Anchor className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* What's Included */}
            {boat.whatsIncluded.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">What&apos;s Included</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {boat.whatsIncluded.map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                          <span className="text-sm font-bold">✓</span>
                        </div>
                        <span className="font-medium text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Available Extras */}
            {boat.availableExtras.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">Available Extras</h2>
                  <div className="flex flex-wrap gap-2">
                    {boat.availableExtras.map((item) => (
                      <div key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        <Anchor className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Target Species */}
            {boat.targetSpecies.length > 0 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-4">Target Species</h2>
                <div className="flex flex-wrap gap-2">
                  {boat.targetSpecies.map((species) => (
                    <div key={species} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                      <Fish className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{species}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-primary/10 overflow-hidden pt-0 gap-0">
                <div className="bg-primary p-4 text-white text-center">
                  <p className="text-sm font-medium opacity-90">Starting from</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(boat.minPricePerPerson)}
                    <span className="text-sm font-normal opacity-75">/person</span>
                  </p>
                </div>
                <CardContent className="p-6 space-y-4">
                  {boat.operatorId ? (
                    <>
                      {/* Booking / Website button -gated by tier */}
                      {(boat.bookingUrl || boat.websiteUrl) && boat.operatorTier?.showBookingUrl !== false ? (
                        <LinkButton
                          href={boat.bookingUrl || boat.websiteUrl}
                          target={boat.bookingLinkTarget === "_blank" ? "_blank" : "_blank"}
                          rel="noopener noreferrer"
                          size="lg"
                          className="w-full"
                        >
                          {boat.bookingButtonText || "Book Now"}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </LinkButton>
                      ) : boat.operatorTier?.showWebsite !== false && boat.websiteUrl ? (
                        <LinkButton
                          href={boat.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="lg"
                          className="w-full"
                        >
                          Visit Website to Book
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </LinkButton>
                      ) : null}

                      {/* Contact Info divider */}
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Contact Info</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                      </div>

                      {/* Contact Info -gated by tier */}
                      <div className="space-y-3">
                        {boat.operatorTier?.showPhone !== false && boat.phone && (
                          <a href={`tel:${boat.phone}`} className="block">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-2 hover:border-primary hover:bg-primary/5">
                              <Phone className="h-5 w-5 text-primary" />
                              <span className="font-bold">{boat.phone}</span>
                            </Button>
                          </a>
                        )}
                        {boat.operatorTier?.showEmail !== false && boat.email && (
                          <a href={`mailto:${boat.email}`} className="block">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-2 hover:border-primary hover:bg-primary/5">
                              <Mail className="h-5 w-5 text-primary" />
                              <span className="font-bold">Email</span>
                            </Button>
                          </a>
                        )}

                        {/* Social Links - gated by tier */}
                        {boat.operatorTier?.showSocialMedia !== false &&
                         (boat.socialFacebook || boat.socialInstagram || boat.socialYoutube || boat.socialX) && (
                          <div className="flex gap-3 justify-center pt-2">
                            {boat.socialFacebook && (
                              <a href={boat.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-colors">
                                <Facebook className="h-5 w-5 text-blue-600" />
                              </a>
                            )}
                            {boat.socialInstagram && (
                              <a href={boat.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-pink-600 hover:bg-pink-50 transition-colors">
                                <Instagram className="h-5 w-5 text-pink-600" />
                              </a>
                            )}
                            {boat.socialX && (
                              <a href={boat.socialX} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-colors">
                                <Twitter className="h-5 w-5 text-gray-900" />
                              </a>
                            )}
                            {boat.socialYoutube && (
                              <a href={boat.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 transition-colors">
                                <Youtube className="h-5 w-5 text-red-600" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mention Party Boats USA */}
                      <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
                        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900 leading-relaxed">
                          Mention <strong>Party Boats USA</strong> when you call to let them know where you found them!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Unclaimed boat -show phone only, no tier gating */}
                      {boat.phone && (
                        <>
                          <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Contact Info</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                          </div>
                          <a href={`tel:${boat.phone}`} className="block">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-2 hover:border-primary hover:bg-primary/5">
                              <Phone className="h-5 w-5 text-primary" />
                              <span className="font-bold">{boat.phone}</span>
                            </Button>
                          </a>
                          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                              Mention <strong>Party Boats USA</strong> when you call to let them know where you found them!
                            </p>
                          </div>
                        </>
                      )}
                      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <h3 className="font-semibold text-yellow-900 mb-2">Unclaimed Listing</h3>
                        <p className="text-sm text-yellow-800">
                          This listing hasn&apos;t been claimed by the operator yet. Are you the owner?{" "}
                          <Link href={`/operator/claim?boatId=${boat.id}&boatName=${encodeURIComponent(boat.name)}`} className="text-primary underline font-medium">
                            Claim this listing
                          </Link>
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Map + Directions */}
              {boat.latitude && boat.longitude && (
                <div className="space-y-3">
                  <BoatLocationMap
                    latitude={Number(boat.latitude)}
                    longitude={Number(boat.longitude)}
                    boatName={boat.name}
                  />
                  <LinkButton
                    href={`https://www.google.com/maps/dir/?api=1&destination=${boat.latitude},${boat.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    className="w-full h-12 border-2 hover:border-primary hover:bg-primary/5"
                  >
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <span className="font-bold">Get Directions</span>
                  </LinkButton>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brag Board Gallery - Pro only, teaser for Basic claimed */}
        {boat.operatorTier?.isHighestTier ? (
          bragPhotos.length > 0 && (
            <section className="mt-12 border-t pt-12">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">Brag Board</h2>
                  <p className="text-muted-foreground mt-1">Recent catches from this boat</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/brag-board?boat=${boat.id}`}>
                    <Button variant="outline" size="sm">Share Your Catch</Button>
                  </Link>
                  <Link href="/brag-board">
                    <Button variant="outline" size="sm">View All Catches</Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bragPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={formatImageUrl(photo.photoUrl)}
                      alt={photo.catchDescription}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium line-clamp-2">{photo.catchDescription}</p>
                        <p className="text-white/80 text-xs mt-1">{photo.submitterName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        ) : !isUnclaimed ? (
          <section className="mt-12 border-t pt-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <h2 className="text-xl font-display font-bold mb-2">Brag Board</h2>
              <p className="text-muted-foreground text-sm">
                Customer catches are showcased here on Pro listings.
              </p>
            </div>
          </section>
        ) : null}

        {/* Gallery - Pro only, teaser for Basic claimed */}
        {boat.operatorTier?.isHighestTier ? (
          galleryImages.length > 0 && (
            <section className="mt-12 border-t pt-12">
              <h2 className="text-2xl font-display font-bold mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryImages.map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={formatImageUrl(url)}
                      alt={`${boat.name} photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )
        ) : !isUnclaimed ? (
          <section className="mt-12 border-t pt-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <h2 className="text-xl font-display font-bold mb-2">Photo Gallery</h2>
              <p className="text-muted-foreground text-sm">
                Photo gallery is available on Pro listings.
              </p>
            </div>
          </section>
        ) : null}

        {/* Reviews */}
        <section className="mt-12 border-t pt-12">
          <ReviewSection
            boatId={boat.id}
            boatSlug={boat.slug}
            reviews={reviewData.reviews}
            averageRating={ratingStats.averageRating}
            reviewCount={ratingStats.reviewCount}
            operatorName={boat.operatorName}
          />
        </section>

        {/* Fleet Boats */}
        {fleetBoats.length > 0 && (
          <section className="mt-12 border-t pt-12">
            <h2 className="text-2xl font-display font-bold mb-6">
              More Boats In Our Fleet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleetBoats.map((fb) => (
                <BoatCard key={fb.id} boat={fb} tierBadge={tierBadges.get(fb.operatorId!) || null} />
              ))}
            </div>
          </section>
        )}

        {/* Nearby Boats (excluding fleet boats) */}
        {filteredNearbyBoats.length > 0 && (
          <section className="mt-12 border-t pt-12">
            <h2 className="text-2xl font-display font-bold mb-6">
              Nearby Party Boats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNearbyBoats.slice(0, 6).map((nb) => (
                <BoatCard key={nb.id} boat={nb} tierBadge={tierBadges.get(nb.operatorId!) || null} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Fixed Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 lg:hidden z-40">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">From</span>
          <span className="text-lg font-bold text-primary truncate">
            {formatPrice(boat.minPricePerPerson)}
            <span className="text-xs font-normal text-muted-foreground">/person</span>
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          {boat.operatorId ? (
            <>
              {boat.operatorTier?.showPhone !== false && boat.phone && (
                <a href={`tel:${boat.phone}`}>
                  <Button variant="outline" size="sm" className="h-10 px-3">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {(boat.bookingUrl || boat.websiteUrl) && boat.operatorTier?.showBookingUrl !== false ? (
                <LinkButton
                  href={boat.bookingUrl || boat.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  className="h-10 px-4 font-bold"
                >
                  {boat.bookingButtonText || "Book Now"}
                </LinkButton>
              ) : boat.operatorTier?.showWebsite !== false && boat.websiteUrl ? (
                <LinkButton
                  href={boat.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  className="h-10 px-4 font-bold"
                >
                  Visit Website
                </LinkButton>
              ) : null}
            </>
          ) : (
            <>
              {boat.phone && (
                <a href={`tel:${boat.phone}`}>
                  <Button variant="outline" size="sm" className="h-10 px-3">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href={`/operator/claim?boatId=${boat.id}&boatName=${encodeURIComponent(boat.name)}`}>
                <Button size="sm" className="h-10 px-4 font-bold">
                  <Ship className="h-4 w-4 mr-1.5" />
                  Claim Listing
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
