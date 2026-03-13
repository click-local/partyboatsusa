import Link from "next/link";
import { ChevronRight, Anchor, Users, Search, Shield, Star, Compass } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Party Boats USA, your trusted directory for finding the best party boat fishing charters across the United States.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  {
    icon: Search,
    title: "Easy Search",
    description:
      "Find party boats by location, price, trip type, and more with our powerful search tools.",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "Read honest reviews from real anglers who have experienced each charter firsthand.",
  },
  {
    icon: Shield,
    title: "Trusted Operators",
    description:
      "We partner with licensed, insured charter operators who meet our quality standards.",
  },
  {
    icon: Compass,
    title: "Expert Guides",
    description:
      "Learn about destinations, species, and fishing tips to make the most of your trip.",
  },
  {
    icon: Users,
    title: "Group-Friendly",
    description:
      "Party boats are perfect for groups. No private charter needed. Just show up and fish!",
  },
  {
    icon: Anchor,
    title: "Nationwide Coverage",
    description:
      "From Florida to Alaska, we cover party boat charters in every coastal state.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">About</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            About Party Boats USA
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Your trusted guide to the best party boat fishing experiences across
            the United States.
          </p>
        </div>
      </section>

      {/* What is Party Boat Fishing */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold mb-4">
            What is Party Boat Fishing?
          </h2>
          <Card>
            <CardContent className="p-6 space-y-4 text-muted-foreground">
              <p>
                Party boat fishing, also known as headboat fishing, is a fun,
                affordable way to get out on the water without chartering an
                entire boat. Instead of paying for a private charter, you buy
                individual tickets (or &quot;heads&quot;) aboard a large vessel
                that typically accommodates 20 to 100+ passengers.
              </p>
              <p>
                These trips are perfect for beginners, families, groups of
                friends, or anyone who wants to try ocean fishing without the
                commitment of a private charter. All bait, tackle, and fishing
                licenses are usually included, and the crew is there to help you
                every step of the way.
              </p>
              <p>
                Party boats depart from ports all across the United States, from
                the Gulf Coast to the Atlantic seaboard, the Pacific Coast, and
                beyond. Whether you&apos;re targeting snapper in Florida, cod in
                New England, or yellowtail in Southern California, there&apos;s
                a party boat trip waiting for you.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-center mb-10">
            Why Choose Party Boats USA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg p-6 shadow-card">
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Are You a Charter Operator?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            List your party boat on Party Boats USA and reach thousands of
            anglers looking for their next fishing adventure.
          </p>
          <div className="flex gap-4 justify-center">
            <LinkButton href="/search" size="lg">
              Browse Boats
            </LinkButton>
            <LinkButton href="/contact" variant="outline" size="lg">
              Contact Us
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
