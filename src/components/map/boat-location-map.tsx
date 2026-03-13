"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface BoatLocationMapProps {
  latitude: number;
  longitude: number;
  boatName: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function BoatLocationMap({ latitude, longitude, boatName }: BoatLocationMapProps) {
  if (!API_KEY) return null;

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="w-full h-[250px] rounded-lg overflow-hidden border border-border">
        <Map
          defaultCenter={{ lat: latitude, lng: longitude }}
          defaultZoom={13}
          mapId="boat-location"
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
        >
          <AdvancedMarker
            position={{ lat: latitude, lng: longitude }}
            title={boatName}
          />
        </Map>
      </div>
    </APIProvider>
  );
}
