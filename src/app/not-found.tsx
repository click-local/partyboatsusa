import Link from "next/link";
import { Anchor, Search, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Browse party boat fishing trips across the USA.",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Anchor className="h-16 w-16 text-primary/30 mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Looks like this page has sailed away. Let&apos;s get you back on course.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Boats
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
