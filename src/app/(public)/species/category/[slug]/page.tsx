import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Fish } from "lucide-react";
import { getSpeciesByCategory, getAllSpeciesCategories } from "@/lib/db/queries/boats";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllSpeciesCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSpeciesByCategory(slug);
  if (!data) return { title: "Category Not Found" };

  const { category, species } = data;
  const title = `${category.name} - Fish Species | PartyBoatsUSA`;
  const desc = category.description
    ? category.description.slice(0, 155)
    : `Browse ${species.length} ${category.name.toLowerCase()} species targeted on party boat fishing charters. Find boats and book your trip.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/species/category/${slug}` },
    openGraph: { title, description: desc, url: `${SITE_URL}/species/category/${slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function SpeciesCategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getSpeciesByCategory(slug);
  if (!data) notFound();

  const { category, species } = data;
  const totalBoats = species.reduce((sum, sp) => sum + sp.boatCount, 0);

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/species" className="hover:text-primary">Fish Species</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-blue-100 max-w-2xl mx-auto mb-3">
              {category.description}
            </p>
          )}
          <p className="text-blue-200 text-sm">
            {species.length} {species.length === 1 ? "species" : "species"}{totalBoats > 0 ? ` across ${totalBoats} boat listings` : ""}
          </p>
        </div>
      </section>

      {/* Species Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((sp) => (
            <Link
              key={sp.id}
              href={`/species/${sp.slug}`}
              className="group flex items-start gap-4 p-5 bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              {sp.imageUrl ? (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={sp.imageUrl}
                    alt={sp.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Fish className="h-7 w-7 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold group-hover:text-primary transition-colors">
                  {sp.name}
                </h2>
                {sp.scientificName && (
                  <p className="text-xs italic text-muted-foreground truncate">{sp.scientificName}</p>
                )}
                {sp.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sp.description}</p>
                )}
                {sp.boatCount > 0 && (
                  <p className="text-xs text-primary font-medium mt-1.5">
                    {sp.boatCount} {sp.boatCount === 1 ? "boat" : "boats"}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Fish Species", item: `${SITE_URL}/species` },
              { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/species/category/${slug}` },
            ],
          }),
        }}
      />

      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: category.name,
            numberOfItems: species.length,
            itemListElement: species.map((sp, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/species/${sp.slug}`,
              name: sp.name,
            })),
          }),
        }}
      />
    </>
  );
}
