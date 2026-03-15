import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { formatImageUrl } from "@/lib/utils";
import type { SelectBoat } from "@/lib/db/schema";

interface BoatCardProps {
  boat: SelectBoat;
  tierBadge?: { name: string; color: string } | null;
}

export function BoatCard({ boat, tierBadge }: BoatCardProps) {
  const imageUrl = formatImageUrl(boat.primaryImageUrl);
  const rating = Number(boat.rating || 0);
  const hasRating = rating > 0;

  return (
    <Link
      href={`/boats/${boat.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {boat.primaryImageUrl ? (
          <Image
            src={imageUrl}
            alt={`${boat.name} - party boat fishing in ${boat.cityName}, ${boat.stateCode}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary/30" />
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
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className="text-white text-sm font-medium">
            {boat.cityName}, {boat.stateCode}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground mb-1">{boat.operatorName}</p>
        <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
          {boat.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Up to {boat.capacity} guests
          </span>
          {hasRating && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">
              ★ {rating.toFixed(1)} ({boat.reviewCount})
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between mt-auto pt-3">
          <span className="text-primary font-semibold">
            {Number(boat.minPricePerPerson) > 0
              ? `From $${Number(boat.minPricePerPerson).toFixed(0)}/person`
              : "Call for pricing"}
          </span>
          <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Details <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
