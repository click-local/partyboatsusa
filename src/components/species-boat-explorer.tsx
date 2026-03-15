"use client";

import { useCallback, useEffect, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Users, ChevronDown, Navigation } from "lucide-react";
import { formatImageUrl } from "@/lib/utils";

interface BoatMarker {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  cityName: string;
}

interface NearbyBoat {
  id: number;
  name: string;
  slug: string;
  operatorName: string;
  operatorId: number | null;
  cityName: string;
  stateCode: string;
  latitude: string | null;
  longitude: string | null;
  primaryImageUrl: string | null;
  imageFocalPointX: number;
  imageFocalPointY: number;
  rating: string | null;
  reviewCount: number;
  capacity: number;
  minPricePerPerson: string | null;
  isFeatured: boolean;
  isFeaturedAdmin: boolean;
  distanceMiles?: number;
}

interface SpeciesBoatExplorerProps {
  speciesId: number;
  speciesName: string;
  speciesSlug: string;
  stateCode?: string;
  stateName?: string;
  stateSlug?: string;
  allBoatMarkers: BoatMarker[];
  fallbackBoats: NearbyBoat[];
  tierBadges: Record<number, { name: string; color: string }>;
  totalCount: number;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function SpeciesBoatExplorer({
  speciesId,
  speciesName,
  stateCode,
  allBoatMarkers,
  fallbackBoats,
  tierBadges,
  totalCount,
}: SpeciesBoatExplorerProps) {
  const [selectedMarker, setSelectedMarker] = useState<BoatMarker | null>(null);
  const [nearbyBoats, setNearbyBoats] = useState<NearbyBoat[]>(fallbackBoats);
  const [nearbyBadges, setNearbyBadges] = useState<Record<number, { name: string; color: string }>>(tierBadges);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [loading, setLoading] = useState(false);

  const handleMarkerClick = useCallback((boat: BoatMarker) => {
    setSelectedMarker(boat);
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Fetch nearby boats when location is obtained
  useEffect(() => {
    if (!userLocation) return;

    setLoading(true);
    const params = new URLSearchParams({
      speciesId: String(speciesId),
      lat: String(userLocation.lat),
      lng: String(userLocation.lng),
      limit: "5",
    });
    if (stateCode) params.set("stateCode", stateCode);

    fetch(`/api/species/nearby?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.boats && data.boats.length > 0) {
          setNearbyBoats(data.boats);
          setNearbyBadges(data.tierBadges || {});
        }
      })
      .catch(() => {
        // Keep fallback boats on error
      })
      .finally(() => setLoading(false));
  }, [userLocation, speciesId, stateCode]);

  // Calculate map center
  const mapCenter = (() => {
    if (userLocation) return userLocation;
    if (allBoatMarkers.length > 0) {
      const avgLat = allBoatMarkers.reduce((s, b) => s + b.latitude, 0) / allBoatMarkers.length;
      const avgLng = allBoatMarkers.reduce((s, b) => s + b.longitude, 0) / allBoatMarkers.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 39.5, lng: -98.35 }; // Center of US
  })();

  // Marker offset logic (from StateBoatsMap)
  const displayMarkers = allBoatMarkers.map((boat, i) => {
    const dupeIndex = allBoatMarkers
      .slice(0, i)
      .filter((b) => b.latitude === boat.latitude && b.longitude === boat.longitude).length;
    if (dupeIndex === 0) return { ...boat, displayLat: boat.latitude, displayLng: boat.longitude };
    const angle = (dupeIndex * 90) * (Math.PI / 180);
    return {
      ...boat,
      displayLat: boat.latitude + 0.002 * Math.cos(angle),
      displayLng: boat.longitude + 0.002 * Math.sin(angle),
    };
  });

  const defaultZoom = stateCode ? 7 : 5;

  return (
    <section className="border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Map */}
          <div className="md:col-span-3">
            {API_KEY && allBoatMarkers.length > 0 ? (
              <APIProvider apiKey={API_KEY}>
                <div className="w-full h-[300px] md:h-[450px] rounded-xl overflow-hidden border">
                  <Map
                    defaultCenter={mapCenter}
                    defaultZoom={defaultZoom}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                    zoomControl={true}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={true}
                  >
                    {displayMarkers.map((boat) => (
                      <Marker
                        key={boat.id}
                        position={{ lat: boat.displayLat, lng: boat.displayLng }}
                        title={boat.name}
                        onClick={() => handleMarkerClick(boat)}
                      />
                    ))}
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        title="Your Location"
                        icon={{
                          path: 0, // google.maps.SymbolPath.CIRCLE
                          scale: 8,
                          fillColor: "#3B82F6",
                          fillOpacity: 1,
                          strokeColor: "#FFFFFF",
                          strokeWeight: 2,
                        }}
                      />
                    )}
                    {selectedMarker && (
                      <InfoWindow
                        position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="p-1 min-w-[160px]">
                          <Link
                            href={`/boats/${selectedMarker.slug}`}
                            className="font-bold text-sm text-primary hover:underline"
                          >
                            {selectedMarker.name}
                          </Link>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {selectedMarker.cityName}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </div>
              </APIProvider>
            ) : (
              <div className="w-full h-[300px] md:h-[450px] rounded-xl border bg-gray-100 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No boats with location data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Boat List */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">
                {locationStatus === "granted" ? (
                  <>
                    <Navigation className="inline h-4 w-4 mr-1.5 text-primary" />
                    Nearest Charters
                  </>
                ) : (
                  <>Top {speciesName} Charters</>
                )}
              </h2>
              {loading && (
                <span className="text-xs text-muted-foreground animate-pulse">Finding nearby...</span>
              )}
            </div>

            {locationStatus === "denied" && (
              <p className="text-xs text-muted-foreground mb-3">
                Allow location access to see boats nearest to you.
              </p>
            )}

            <div className="space-y-3">
              {nearbyBoats.map((boat) => {
                const imageUrl = formatImageUrl(boat.primaryImageUrl);
                const rating = Number(boat.rating || 0);
                const badge = boat.operatorId ? nearbyBadges[boat.operatorId] : undefined;

                return (
                  <Link
                    key={boat.id}
                    href={`/boats/${boat.slug}`}
                    className="flex gap-3 p-2 rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="relative w-20 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      {boat.primaryImageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={boat.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                          style={{
                            objectPosition: `${boat.imageFocalPointX}% ${boat.imageFocalPointY}%`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {boat.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{boat.cityName}, {boat.stateCode}</span>
                        {rating > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-green-700">
                            <Star className="h-3 w-3 fill-current" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                        {badge && (
                          <span
                            className="px-1.5 py-0.5 text-white text-[10px] font-semibold rounded"
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Users className="h-3 w-3" /> Up to {boat.capacity}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {Number(boat.minPricePerPerson) > 0
                            ? `From $${Number(boat.minPricePerPerson).toFixed(0)}/person`
                            : "Call for pricing"}
                        </span>
                      </div>
                      {boat.distanceMiles != null && (
                        <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
                          {boat.distanceMiles} miles away
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalCount > 5 && (
              <a
                href="#all-boats"
                className="mt-4 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                View All {totalCount} Charters
                <ChevronDown className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
