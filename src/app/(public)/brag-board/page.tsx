import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BragBoardFormDialog } from "@/components/brag-board-form-dialog";
import { BragBoardFilters } from "@/components/brag-board-filters";
import { getBragBoardPhotos } from "@/lib/db/queries/brag-board";
import { db } from "@/lib/db";
import { boats, species, bragBoardPhotoSpecies, bragBoardPhotos, states } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { formatImageUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Brag Board",
  description:
    "Check out the latest catches from party boat fishing trips across the USA! Share your own photos on the brag board.",
  alternates: { canonical: "/brag-board" },
};

interface Props {
  searchParams: Promise<{ boat?: string; state?: string; species?: string }>;
}

export default async function BragBoardPage({ searchParams }: Props) {
  const { boat: boatParam, state: stateParam, species: speciesParam } = await searchParams;

  const filters = {
    stateCode: stateParam || undefined,
    speciesId: speciesParam ? Number(speciesParam) : undefined,
  };

  const [{ photos, total }, boatsForSelect, speciesList, stateOptions] = await Promise.all([
    getBragBoardPhotos(1, 48, filters),
    db
      .select({
        id: boats.id,
        name: boats.name,
        cityName: boats.cityName,
        stateCode: boats.stateCode,
      })
      .from(boats)
      .where(eq(boats.isPublished, true))
      .orderBy(asc(boats.name)),
    db
      .selectDistinct({ id: species.id, name: species.name })
      .from(bragBoardPhotoSpecies)
      .innerJoin(species, eq(bragBoardPhotoSpecies.speciesId, species.id))
      .innerJoin(bragBoardPhotos, and(
        eq(bragBoardPhotoSpecies.photoId, bragBoardPhotos.id),
        eq(bragBoardPhotos.status, "approved")
      ))
      .orderBy(asc(species.name)),
    db
      .selectDistinct({ code: states.code, name: states.name })
      .from(bragBoardPhotos)
      .innerJoin(boats, eq(bragBoardPhotos.boatId, boats.id))
      .innerJoin(states, eq(boats.stateCode, states.code))
      .where(eq(bragBoardPhotos.status, "approved"))
      .orderBy(asc(states.name)),
  ]);

  const preselectedBoatId = boatParam ? Number(boatParam) : undefined;

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
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            Brag Board
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            Show off your best catches! Browse photos from anglers across the
            country or share your own party boat fishing memories.
          </p>
          <BragBoardFormDialog
            boats={boatsForSelect}
            speciesList={speciesList}
            preselectedBoatId={preselectedBoatId}
          >
            <span className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
              <Camera className="h-4 w-4" />
              Submit Your Catch
            </span>
          </BragBoardFormDialog>
        </div>
      </section>

      {/* Filters + Photo Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <BragBoardFilters states={stateOptions} speciesList={speciesList} />
          <p className="text-sm text-muted-foreground shrink-0">
            {total} {total === 1 ? "photo" : "photos"}{(stateParam || speciesParam) ? " found" : " shared"}
          </p>
        </div>
        {photos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(({ photo, boatName, boatSlug, speciesNames }) => (
                <Card key={photo.id} className="group overflow-hidden pt-0 gap-0">
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
                    {speciesNames.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {speciesNames.map((name) => (
                          <span
                            key={name}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
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
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No photos yet. Be the first to share your catch!
            </p>
            <div className="mt-4">
              <BragBoardFormDialog
                boats={boatsForSelect}
                speciesList={speciesList}
                preselectedBoatId={preselectedBoatId}
              >
                <span className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  Submit Your Catch
                </span>
              </BragBoardFormDialog>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
