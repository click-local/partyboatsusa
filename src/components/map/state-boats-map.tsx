"use client";

import { useCallback, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import Link from "next/link";

interface BoatMarker {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  cityName: string;
}

interface StateBoatsMapProps {
  boats: BoatMarker[];
  center: { lat: number; lng: number };
  className?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function StateBoatsMap({ boats, center, className }: StateBoatsMapProps) {
  const [selectedBoat, setSelectedBoat] = useState<BoatMarker | null>(null);

  const handleMarkerClick = useCallback((boat: BoatMarker) => {
    setSelectedBoat(boat);
  }, []);

  if (!API_KEY || boats.length === 0) return null;

  // Slightly offset markers that share the same coordinates so both are clickable.
  // The original coordinates are preserved for the info window / directions link.
  const displayBoats = boats.map((boat, i) => {
    const dupeIndex = boats
      .slice(0, i)
      .filter((b) => b.latitude === boat.latitude && b.longitude === boat.longitude).length;
    if (dupeIndex === 0) return { ...boat, displayLat: boat.latitude, displayLng: boat.longitude };
    // ~200m offset per duplicate — enough to click, close enough to be accurate
    const angle = (dupeIndex * 90) * (Math.PI / 180);
    return {
      ...boat,
      displayLat: boat.latitude + 0.002 * Math.cos(angle),
      displayLng: boat.longitude + 0.002 * Math.sin(angle),
    };
  });

  return (
    <APIProvider apiKey={API_KEY}>
      <div className={className || "w-full h-[400px]"}>
        <Map
          defaultCenter={center}
          defaultZoom={7}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          {displayBoats.map((boat) => (
            <Marker
              key={boat.id}
              position={{ lat: boat.displayLat, lng: boat.displayLng }}
              title={boat.name}
              onClick={() => handleMarkerClick(boat)}
            />
          ))}
          {selectedBoat && (
            <InfoWindow
              position={{ lat: selectedBoat.latitude, lng: selectedBoat.longitude }}
              onCloseClick={() => setSelectedBoat(null)}
            >
              <div className="p-1 min-w-[160px]">
                <Link
                  href={`/boats/${selectedBoat.slug}`}
                  className="font-bold text-sm text-primary hover:underline"
                >
                  {selectedBoat.name}
                </Link>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedBoat.cityName}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
