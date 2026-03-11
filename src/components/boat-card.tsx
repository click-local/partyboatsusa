import Link from "next/link";
import Image from "next/image";
import { Star, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatImageUrl, formatPrice } from "@/lib/utils";
import type { SelectBoat } from "@/lib/db/schema";

interface BoatCardProps {
  boat: SelectBoat;
}

export function BoatCard({ boat }: BoatCardProps) {
  const imageUrl = formatImageUrl(boat.primaryImageUrl);
  const rating = Number(boat.rating || 0);
  const hasRating = rating > 0;

  return (
    <Link href={`/boats/${boat.slug}`}>
      <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-300 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={boat.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            style={{
              objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
            }}
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {boat.isFeaturedAdmin && (
              <Badge className="bg-amber-500 text-white text-xs">Featured</Badge>
            )}
            {boat.isFeatured && !boat.isFeaturedAdmin && (
              <Badge className="bg-primary text-white text-xs">Featured</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Operator */}
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {boat.operatorName}
          </p>

          {/* Boat Name */}
          <h3 className="font-display font-semibold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {boat.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {boat.cityName}, {boat.stateCode}
            </span>
          </div>

          {/* Rating & Capacity */}
          <div className="flex items-center justify-between mb-3">
            {hasRating ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
                {boat.reviewCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({boat.reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Up to {boat.capacity}</span>
            </div>
          </div>

          {/* Price */}
          <div className="border-t pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-primary">
                {formatPrice(boat.minPricePerPerson)}
              </span>
              {Number(boat.minPricePerPerson) > 0 && (
                <span className="text-xs text-muted-foreground">per person</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
