import { db } from "@/lib/db";
import { siteSettings, pageSeoSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSiteSettings() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  return settings ?? null;
}

export async function getPageSeoSettings(pageKey: string) {
  const [settings] = await db
    .select()
    .from(pageSeoSettings)
    .where(eq(pageSeoSettings.pageKey, pageKey));
  return settings ?? null;
}
