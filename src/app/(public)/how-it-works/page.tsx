import Link from "next/link";
import { ChevronRight, Search, Star, CalendarCheck, Anchor, CheckCircle } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Party Boats USA makes it easy to find, compare, and book party boat fishing trips across the United States.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: "Search for Party Boats",
    description:
      "Use our search tools to find party boat fishing charters near you. Filter by location, price, trip type, capacity, and more to narrow down your options.",
  },
  {
    number: 2,
    icon: Star,
    title: "Compare & Read Reviews",
    description:
      "View detailed listings with photos, amenities, target species, and honest reviews from other anglers. Compare prices and options side by side.",
  },
  {
    number: 3,
    icon: CalendarCheck,
    title: "Book Your Trip",
    description:
      "Once you find the perfect boat, book directly with the operator through their website or give them a call. We connect you straight to the source.",
  },
  {
    number: 4,
    icon: Anchor,
    title: "Go Fishing!",
    description:
      "Show up at the dock, grab your spot on the boat, and enjoy a day of fishing. Bait, tackle, and licenses are typically included — just bring your sunscreen!",
  },
];

const TIPS = [
  "Arrive 30 minutes before departure to secure your spot at the rail",
  "Bring sunscreen, sunglasses, a hat, and layered clothing",
  "Wear non-slip shoes with closed toes",
  "If prone to seasickness, take medication before departure",
  "Bring a small cooler for drinks and snacks",
  "Ask the crew for tips — they know the best techniques",
  "Don't forget your camera for the brag board!",
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">How It Works</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            How It Works
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Finding and booking a party boat fishing trip is easy. Here&apos;s
            how to get started.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-16">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col md:flex-row gap-8 items-center ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className={index % 2 !== 0 ? "md:text-right" : ""}>
                <div className="text-sm font-semibold text-primary mb-1">
                  Step {step.number}
                </div>
                <h2 className="text-2xl font-display font-bold mb-3">
                  {step.title}
                </h2>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Tips for Your First Trip
            </h2>
            <div className="bg-white rounded-lg shadow-card p-6">
              <ul className="space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to Find Your Boat?
          </h2>
          <p className="text-muted-foreground mb-6">
            Browse hundreds of party boat fishing charters across the United States.
          </p>
          <LinkButton href="/search" size="lg">
            Browse Boats
          </LinkButton>
        </div>
      </section>
    </>
  );
}
