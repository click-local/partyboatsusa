import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Users, Star } from "lucide-react";
import { formatImageUrl } from "@/lib/utils";
import type { SelectBoat } from "@/lib/db/schema";

interface FeaturedBoatCardProps {
  boat: SelectBoat;
  tierBadge?: { name: string; color: string } | null;
}

export function FeaturedBoatCard({ boat, tierBadge }: FeaturedBoatCardProps) {
  const imageUrl = formatImageUrl(boat.primaryImageUrl);
  const rating = Number(boat.rating || 0);
  const hasRating = rating > 0;

  return (
    <Link
      href={`/boats/${boat.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col md:flex-row"
    >
      {/* Image */}
      <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-muted shrink-0">
        {boat.primaryImageUrl ? (
          <Image
            src={imageUrl}
            alt={`${boat.name} - party boat fishing in ${boat.cityName}, ${boat.stateCode}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 40vw"
            style={{
              objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {(boat.isFeaturedAdmin || boat.isFeatured) && (
            <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
              Featured
            </span>
          )}
          {tierBadge && (
            <span
              className="px-2 py-0.5 text-white text-xs font-semibold rounded"
              style={{ backgroundColor: tierBadge.color }}
            >
              {tierBadge.name}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{boat.operatorName}</p>
          <h3 className="font-display font-semibold text-xl group-hover:text-primary transition-colors mb-2">
            {boat.name}
          </h3>
          {hasRating && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({boat.reviewCount} review{Number(boat.reviewCount) !== 1 ? "s" : ""})</span>
            </div>
          )}
          {boat.descriptionShort && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {boat.descriptionShort}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Up to {boat.capacity} guests
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {boat.cityName}, {boat.stateCode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold text-lg">
              {Number(boat.minPricePerPerson) > 0
                ? `From $${Number(boat.minPricePerPerson).toFixed(0)}/person`
                : "Call for pricing"}
            </span>
            <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
