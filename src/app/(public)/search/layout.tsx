import type { Metadata } from "next";
import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const metadata: Metadata = {
  title: "Search Party Boats | Find Fishing Charters Near You",
  description:
    "Search and compare party boat fishing charters across the United States. Filter by location, amenities, price, capacity, and ratings to find your perfect fishing trip.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search Party Boats | Find Fishing Charters Near You",
    description:
      "Search and compare party boat fishing charters across the United States. Filter by location, amenities, price, capacity, and ratings.",
    url: `${SITE_URL}/search`,
    type: "website",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Party Boats USA",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="search-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
