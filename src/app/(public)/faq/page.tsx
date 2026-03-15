import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

interface FaqCategory {
  title: string;
  faqs: { question: string; answer: React.ReactNode }[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Before Your Trip",
    faqs: [
      {
        question: "What is a party boat (headboat)?",
        answer:
          "A party boat, also known as a headboat, is a large fishing vessel that sells individual tickets rather than requiring you to charter the entire boat. The name 'headboat' comes from the fact that you pay 'per head' (per person). These boats typically hold 20 to 100+ passengers and provide all the equipment you need for a day of fishing.",
      },
      {
        question: "What's the difference between a party boat and a private charter?",
        answer: (
          <>
            Party boats sell individual tickets so you share the boat with other anglers, making them much more affordable. Private charters rent the entire boat to one group for a custom experience. Party boats are ideal if you want a fun, social outing without the higher cost of a private trip. You can{" "}
            <Link href="/search" className="text-primary hover:underline">
              browse party boats
            </Link>{" "}
            to compare options and pricing.
          </>
        ),
      },
      {
        question: "How much does a party boat trip cost?",
        answer:
          "Most party boat trips range from $40 to $150 per person depending on trip length, location, and season. Half-day trips are typically the most affordable, while full-day, overnight, and deep-sea trips cost more. Some specialty or extended trips can run several hundred to over a thousand dollars per person. Check each listing for current pricing.",
      },
      {
        question: "How do I find party boats near me?",
        answer: (
          <>
            Use our{" "}
            <Link href="/search" className="text-primary hover:underline">
              search page
            </Link>{" "}
            to find party boats by location, price, trip type, and more. You can also{" "}
            <Link href="/destinations" className="text-primary hover:underline">
              browse by state
            </Link>{" "}
            to see all available charters in your area.
          </>
        ),
      },
      {
        question: "Do I need to make a reservation?",
        answer: (
          <>
            While some boats accept walk-ups, we strongly recommend booking in advance, especially during peak season (summer months) and on weekends. Popular boats can fill up quickly.{" "}
            <Link href="/search" className="text-primary hover:underline">
              Browse available boats
            </Link>{" "}
            and reserve your spot today.
          </>
        ),
      },
      {
        question: "Do I need fishing experience?",
        answer:
          "No! Party boats are perfect for beginners. The crew will help you bait your hook, show you how to cast, and assist you when you get a bite. They're experienced at helping first-timers have a great experience.",
      },
    ],
  },
  {
    title: "On the Water",
    faqs: [
      {
        question: "What's included in the price?",
        answer:
          "Most party boat trips include fishing tackle (rod, reel, bait), a fishing license for the duration of the trip, and instruction from the crew. Some boats also include fish cleaning services. Food and drinks are usually available for purchase on board or you can bring your own. Check each listing for specific details.",
      },
      {
        question: "What fish will I catch?",
        answer: (
          <>
            It depends on your location and the time of year. Common catches include snapper, grouper, sea bass, cod, flounder, and many more. Each boat listing on our site shows the{" "}
            <Link href="/species" className="text-primary hover:underline">
              target species
            </Link>{" "}
            you can expect to catch, so you can pick the trip that matches what you want to fish for.
          </>
        ),
      },
      {
        question: "How long are the trips?",
        answer:
          "Trip lengths vary by operator and location. Common options include half-day trips (4-5 hours), full-day trips (8-10 hours), and overnight trips. Some operators also offer shorter 2-3 hour trips that are great for families with young children.",
      },
      {
        question: "Can I keep the fish I catch?",
        answer:
          "Yes! In most cases you can keep the fish you catch, subject to local regulations regarding species, size limits, and bag limits. The crew will inform you of current regulations and many boats offer fish cleaning services so you can take home ready-to-cook fillets.",
      },
      {
        question: "Can I bring my own fishing rod?",
        answer:
          "Most party boats allow you to bring your own rod and tackle, but it's not required. The boat provides everything you need. If you do bring your own gear, check with the operator beforehand about any restrictions, especially regarding the type of rigs allowed.",
      },
      {
        question: "Do I need to tip the crew?",
        answer:
          "Tipping is customary on party boat fishing trips. The industry standard is 15-20% of your ticket price, though any amount is appreciated. The crew works hard to find fish, help passengers, and clean your catch. Tips are typically collected at the end of the trip.",
      },
    ],
  },
  {
    title: "Safety & Accessibility",
    faqs: [
      {
        question: "What should I bring?",
        answer:
          "We recommend bringing sunscreen, sunglasses, a hat, layers of clothing (it can be cooler on the water), non-slip closed-toe shoes, sea sickness medication if you're prone to motion sickness, a small cooler with drinks and snacks, and a camera for your catches!",
      },
      {
        question: "What if the weather is bad?",
        answer:
          "Safety is the top priority. If weather conditions are unsafe, the trip will be cancelled and you'll typically receive a full refund or the option to reschedule. For light rain, trips usually still go out. Fish actually bite better in overcast conditions! Check with your operator for their specific cancellation policy.",
      },
      {
        question: "Are party boats safe for children?",
        answer:
          "Party boats are generally safe for children and many families bring kids along. However, age requirements vary by operator. Some have minimum age requirements while others welcome all ages. Life jackets are available on board and the crew is trained in safety procedures. Check with the specific operator for their age policies.",
      },
      {
        question: "Are party boats wheelchair accessible?",
        answer:
          "Accessibility varies by boat. Some newer or larger vessels have accessible features, while smaller boats may not. We recommend contacting the operator directly to discuss your specific needs before booking. They can let you know about boarding arrangements, onboard layout, and any accommodations they can provide.",
      },
    ],
  },
  {
    title: "About Party Boats USA",
    faqs: [
      {
        question: "How is Party Boats USA different from the actual charter operators?",
        answer:
          "Party Boats USA is a directory and comparison platform. We help you find and compare party boat charters, but we don't operate any boats ourselves. When you're ready to book, we connect you directly with the charter operator. This means you always get the best price and deal directly with the people running your trip.",
      },
      {
        question: "How do I list my boat on Party Boats USA?",
        answer: (
          <>
            If you're a charter operator, you can{" "}
            <Link href="/operator/login" className="text-primary hover:underline">
              create a free account
            </Link>{" "}
            and add your boat listing in minutes. We offer free and premium tiers with features like priority placement, booking integration, and more. It's a great way to reach thousands of anglers looking for their next trip.
          </>
        ),
      },
    ],
  },
];

// Flatten for JSON-LD
const ALL_FAQS = FAQ_CATEGORIES.flatMap((cat) =>
  cat.faqs.map((faq) => ({
    question: faq.question,
    // For JSON-LD, strip JSX and use plain text
    answer:
      typeof faq.answer === "string"
        ? faq.answer
        : faq.question === "What's the difference between a party boat and a private charter?"
          ? "Party boats sell individual tickets so you share the boat with other anglers, making them much more affordable. Private charters rent the entire boat to one group for a custom experience. Party boats are ideal if you want a fun, social outing without the higher cost of a private trip."
          : faq.question === "Do I need to make a reservation?"
          ? "While some boats accept walk-ups, we strongly recommend booking in advance, especially during peak season (summer months) and on weekends. Popular boats can fill up quickly. Browse available boats and reserve your spot today."
          : faq.question === "How do I find party boats near me?"
            ? "Use our search page to find party boats by location, price, trip type, and more. You can also browse by state to see all available charters in your area."
            : faq.question === "What fish will I catch?"
              ? "It depends on your location and the time of year. Common catches include snapper, grouper, sea bass, cod, flounder, and many more. Each boat listing shows the target species you can expect to catch."
              : faq.question === "How do I list my boat on Party Boats USA?"
                ? "If you're a charter operator, you can create a free account and add your boat listing in minutes. We offer free and premium tiers with features like priority placement, booking integration, and more."
                : "",
  }))
);

export const metadata: Metadata = {
  title: "Frequently Asked Questions | PartyBoatsUSA",
  description:
    "Find answers to common questions about party boat fishing, trip costs, what to bring, tipping, booking, and more.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ - Party Boat Fishing Questions | PartyBoatsUSA",
    description: "Find answers to common questions about party boat fishing, trip costs, what to bring, tipping, booking, and more.",
    url: `${SITE_URL}/faq`,
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Party Boat Fishing Questions | PartyBoatsUSA",
    description: "Find answers to common questions about party boat fishing, trip costs, what to bring, tipping, booking, and more.",
  },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ALL_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
            ],
          }),
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">FAQ</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Everything you need to know about party boat fishing.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h2 className="text-xl font-display font-bold mb-4 text-primary">
                {category.title}
              </h2>
              <Accordion className="space-y-3">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    className="bg-white border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re here to help. Send us a message and we&apos;ll get back to you.
          </p>
          <LinkButton href="/contact" size="lg">
            Contact Us
          </LinkButton>
        </div>
      </section>
    </>
  );
}
