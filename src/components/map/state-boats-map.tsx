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

  // Offset boats that share the exact same coordinates so all markers are visible
  const offsetBoats = boats.map((boat, i) => {
    const dupes = boats.filter(
      (b, j) => j < i && b.latitude === boat.latitude && b.longitude === boat.longitude
    );
    if (dupes.length === 0) return boat;
    const offset = dupes.length * 0.003;
    return { ...boat, latitude: boat.latitude + offset, longitude: boat.longitude + offset };
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
          {offsetBoats.map((boat) => (
            <Marker
              key={boat.id}
              position={{ lat: boat.latitude, lng: boat.longitude }}
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
