import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Party Boats USA - Find the Best Party Boat Fishing Trips in the USA",
    template: "%s | Party Boats USA",
  },
  description:
    "Discover and book top-rated headboats and open party fishing charters across the United States. Compare prices, read reviews, and find the perfect fishing trip.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com"),
  openGraph: {
    type: "website",
    siteName: "Party Boats USA",
    images: ["/opengraph.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
