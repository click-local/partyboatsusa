import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Party Boats USA. Contact us about listing your charter boat, partnership opportunities, or general inquiries about party boat fishing trips.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Party Boats USA",
    description:
      "Get in touch with Party Boats USA. Contact us about listing your charter boat, partnerships, or general inquiries.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
