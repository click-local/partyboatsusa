import { db } from "@/lib/db";
import { destinationPages, contentBlocks, states, cities } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getAllDestinationPages() {
  return db
    .select()
    .from(destinationPages)
    .where(eq(destinationPages.isPublished, true))
    .orderBy(destinationPages.type);
}

export async function getDestinationPageByStateSlug(slug: string) {
  // Find the state first
  const [state] = await db.select().from(states).where(eq(states.slug, slug));
  if (!state) return null;

  // Find the destination page for this state
  const [page] = await db
    .select()
    .from(destinationPages)
    .where(
      and(
        eq(destinationPages.type, "state"),
        eq(destinationPages.referenceId, state.id),
        eq(destinationPages.isPublished, true)
      )
    );

  if (!page) return null;

  // Get content blocks
  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.destinationPageId, page.id),
        eq(contentBlocks.isVisible, true)
      )
    )
    .orderBy(asc(contentBlocks.blockOrder));

  return { ...page, state, blocks };
}

export async function getDestinationPageByCitySlug(slug: string) {
  const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
  if (!city) return null;

  const [page] = await db
    .select()
    .from(destinationPages)
    .where(
      and(
        eq(destinationPages.type, "city"),
        eq(destinationPages.referenceId, city.id),
        eq(destinationPages.isPublished, true)
      )
    );

  if (!page) return null;

  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.destinationPageId, page.id),
        eq(contentBlocks.isVisible, true)
      )
    )
    .orderBy(asc(contentBlocks.blockOrder));

  // Get the state for breadcrumbs
  const [state] = await db.select().from(states).where(eq(states.code, city.stateCode));

  return { ...page, city, state, blocks };
}
