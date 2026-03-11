import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Mail, Star, Users, Anchor, Fish,
  ChevronRight, ExternalLink, Facebook, Instagram, Youtube,
} from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BoatCard } from "@/components/boat-card";
import { ReviewSection } from "@/components/review-section";
import { getBoatBySlug, getNearbyBoats, getFleetBoats } from "@/lib/db/queries/boats";
import { getReviewsByBoat, getBoatRatingStats } from "@/lib/db/queries/reviews";
import { formatImageUrl, formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const boat = await getBoatBySlug(slug);
  if (!boat) return { title: "Boat Not Found" };

  return {
    title: boat.seoTitle || `${boat.name} - Party Boat Fishing in ${boat.cityName}, ${boat.stateCode}`,
    description: boat.seoDescription || boat.descriptionShort || boat.descriptionLong?.slice(0, 160),
    openGraph: {
      title: boat.name,
      description: boat.descriptionShort || undefined,
      images: boat.primaryImageUrl ? [formatImageUrl(boat.primaryImageUrl)] : undefined,
    },
  };
}

export default async function BoatDetailPage({ params }: Props) {
  const { slug } = await params;
  const boat = await getBoatBySlug(slug);
  if (!boat) notFound();

  const [reviewData, ratingStats, nearbyBoats, fleetBoats] = await Promise.all([
    getReviewsByBoat(boat.id),
    getBoatRatingStats(boat.id),
    boat.latitude && boat.longitude
      ? getNearbyBoats(boat.id, boat.latitude, boat.longitude, 6)
      : Promise.resolve([]),
    boat.operatorId
      ? getFleetBoats(boat.operatorId, boat.id)
      : Promise.resolve([]),
  ]);

  const heroImage = formatImageUrl(boat.primaryImageUrl);
  const galleryImages = boat.galleryImageUrls?.filter(Boolean) || [];
  const rating = Number(boat.rating || 0);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
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
    url: boat.websiteUrl,
    aggregateRating: rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: boat.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/search" className="hover:text-primary">Boats</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/states/${boat.stateCode.toLowerCase()}`} className="hover:text-primary">
              {boat.stateCode}
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
          style={{ objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
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
            <p className="text-blue-100 mt-1">{boat.operatorName}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {boat.cityName}, {boat.stateCode}
                {boat.portName && ` — ${boat.portName}`}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Up to {boat.capacity} passengers
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)} ({boat.reviewCount} reviews)
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">About This Boat</h2>
              {boat.descriptionShort && (
                <p className="text-lg text-muted-foreground mb-4">{boat.descriptionShort}</p>
              )}
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                {boat.descriptionLong}
              </div>
            </div>

            {/* Trip Types */}
            {boat.tripTypes.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold mb-3">Trip Types</h2>
                <div className="flex flex-wrap gap-2">
                  {boat.tripTypes.map((tt) => (
                    <Badge key={tt.id} variant="secondary" className="text-sm">
                      {tt.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Target Species */}
            {boat.targetSpecies.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold mb-3">Target Species</h2>
                <div className="flex flex-wrap gap-2">
                  {boat.targetSpecies.map((species) => (
                    <Badge key={species} variant="outline" className="text-sm">
                      <Fish className="h-3 w-3 mr-1" />
                      {species}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {boat.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {boat.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-sm">
                      <Anchor className="h-4 w-4 text-primary shrink-0" />
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            {boat.whatsIncluded.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold mb-3">What&apos;s Included</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {boat.whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold mb-3">Photo Gallery</h2>
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
              </div>
            )}

            <Separator />

            {/* Reviews */}
            <ReviewSection
              boatId={boat.id}
              boatSlug={boat.slug}
              reviews={reviewData.reviews}
              averageRating={ratingStats.averageRating}
              reviewCount={ratingStats.reviewCount}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book This Trip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(boat.minPricePerPerson)}
                    {Number(boat.maxPricePerPerson) > Number(boat.minPricePerPerson) && (
                      <span className="text-lg text-muted-foreground">
                        {" "}– {formatPrice(boat.maxPricePerPerson)}
                      </span>
                    )}
                  </div>
                  {Number(boat.minPricePerPerson) > 0 && (
                    <p className="text-sm text-muted-foreground">per person</p>
                  )}
                </div>

                {boat.bookingUrl ? (
                  <LinkButton
                    href={boat.bookingUrl}
                    target={boat.bookingLinkTarget === "_blank" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    size="lg"
                    className="w-full"
                  >
                    {boat.bookingButtonText || "Book Now"}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </LinkButton>
                ) : (
                  <LinkButton
                    href={boat.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    className="w-full"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </LinkButton>
                )}

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <a href={`tel:${boat.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                    <Phone className="h-4 w-4" />
                    {boat.phone}
                  </a>
                  {boat.email && (
                    <a href={`mailto:${boat.email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                      <Mail className="h-4 w-4" />
                      {boat.email}
                    </a>
                  )}
                  <a
                    href={boat.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </div>

                {/* Social Links */}
                {(boat.socialFacebook || boat.socialInstagram || boat.socialYoutube) && (
                  <>
                    <Separator />
                    <div className="flex gap-3 justify-center">
                      {boat.socialFacebook && (
                        <a href={boat.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {boat.socialInstagram && (
                        <a href={boat.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {boat.socialYoutube && (
                        <a href={boat.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fleet Boats */}
        {fleetBoats.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6">
              More From {boat.operatorName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleetBoats.map((fb) => (
                <BoatCard key={fb.id} boat={fb} />
              ))}
            </div>
          </section>
        )}

        {/* Nearby Boats */}
        {nearbyBoats.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6">
              Nearby Party Boats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyBoats.slice(0, 6).map((nb) => (
                <BoatCard key={nb.id} boat={nb} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
