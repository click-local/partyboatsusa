import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Camera } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Card } from "@/components/ui/card";
import { getBragBoardPhotos } from "@/lib/db/queries/brag-board";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brag Board",
  description:
    "Check out the latest catches from party boat fishing trips across the USA! Share your own photos on the brag board.",
};

export default async function BragBoardPage() {
  const { photos, total } = await getBragBoardPhotos(1, 48);

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Brag Board</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Brag Board
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            Show off your best catches! Browse photos from anglers across the
            country or share your own party boat fishing memories.
          </p>
          <LinkButton href="/contact" variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            Submit Your Catch
          </LinkButton>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="container mx-auto px-4 py-12">
        {photos.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {total} {total === 1 ? "photo" : "photos"} shared
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(({ photo, boatName, boatSlug }) => (
                <Card key={photo.id} className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={formatImageUrl(photo.photoUrl)}
                      alt={photo.catchDescription}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {photo.catchDescription}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{photo.submitterName}</span>
                      <Link
                        href={`/boats/${boatSlug}`}
                        className="text-primary hover:underline truncate ml-2"
                      >
                        {boatName}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Camera className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold mb-2">
              No Photos Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Be the first to share your catch on the brag board!
            </p>
            <LinkButton href="/contact">
              Submit a Photo
            </LinkButton>
          </div>
        )}
      </section>
    </>
  );
}
