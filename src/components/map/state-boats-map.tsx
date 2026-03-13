"use client";

import { useCallback, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { MapPin } from "lucide-react";

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
  stateName: string;
  center: { lat: number; lng: number };
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function StateBoatsMap({ boats, stateName, center }: StateBoatsMapProps) {
  const [selectedBoat, setSelectedBoat] = useState<BoatMarker | null>(null);

  const handleMarkerClick = useCallback((boat: BoatMarker) => {
    setSelectedBoat(boat);
  }, []);

  if (!API_KEY || boats.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        Boat Locations in {stateName}
      </h2>
      <APIProvider apiKey={API_KEY}>
        <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-sm">
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
            {boats.map((boat) => (
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
    </section>
  );
}
