import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Party Boats",
  description:
    "Search and compare party boat fishing charters across the United States. Filter by location, price, capacity, and ratings to find your perfect fishing trip.",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
