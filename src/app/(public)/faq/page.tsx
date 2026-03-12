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

const FAQS = [
  {
    question: "What is a party boat (headboat)?",
    answer:
      "A party boat, also known as a headboat, is a large fishing vessel that sells individual tickets rather than requiring you to charter the entire boat. The name 'headboat' comes from the fact that you pay 'per head' (per person). These boats typically hold 20 to 100+ passengers and provide all the equipment you need for a day of fishing.",
  },
  {
    question: "What's included in the price?",
    answer:
      "Most party boat trips include fishing tackle (rod, reel, bait), a fishing license for the duration of the trip, and instruction from the crew. Some boats also include fish cleaning services. Food and drinks are usually available for purchase on board or you can bring your own. Check each listing for specific details.",
  },
  {
    question: "Do I need fishing experience?",
    answer:
      "No! Party boats are perfect for beginners. The crew will help you bait your hook, show you how to cast, and assist you when you get a bite. They're experienced at helping first-timers have a great experience.",
  },
  {
    question: "How long are the trips?",
    answer:
      "Trip lengths vary by operator and location. Common options include half-day trips (4-5 hours), full-day trips (8-10 hours), and overnight trips. Some operators also offer shorter 2-3 hour trips that are great for families with young children.",
  },
  {
    question: "What should I bring?",
    answer:
      "We recommend bringing sunscreen, sunglasses, a hat, layers of clothing (it can be cooler on the water), non-slip closed-toe shoes, sea sickness medication if you're prone to motion sickness, a small cooler with drinks and snacks, and a camera for your catches!",
  },
  {
    question: "Can I keep the fish I catch?",
    answer:
      "Yes! In most cases you can keep the fish you catch, subject to local regulations regarding species, size limits, and bag limits. The crew will inform you of current regulations and many boats offer fish cleaning services so you can take home ready-to-cook fillets.",
  },
  {
    question: "What if the weather is bad?",
    answer:
      "Safety is the top priority. If weather conditions are unsafe, the trip will be cancelled and you'll typically receive a full refund or the option to reschedule. For light rain, trips usually still go out — fish actually bite better in overcast conditions! Check with your operator for their specific cancellation policy.",
  },
  {
    question: "Are party boats safe for children?",
    answer:
      "Party boats are generally safe for children and many families bring kids along. However, age requirements vary by operator — some have minimum age requirements while others welcome all ages. Life jackets are available on board and the crew is trained in safety procedures. Check with the specific operator for their age policies.",
  },
  {
    question: "Do I need to make a reservation?",
    answer:
      "While some boats accept walk-ups, we strongly recommend making a reservation in advance, especially during peak season (summer months) and on weekends. Popular boats can fill up quickly. You can book directly through the operator's website or by calling them.",
  },
  {
    question: "How is Party Boats USA different from the actual charter operators?",
    answer:
      "Party Boats USA is a directory and comparison platform — we help you find and compare party boat charters, but we don't operate any boats ourselves. When you're ready to book, we connect you directly with the charter operator. This means you always get the best price and deal directly with the people running your trip.",
  },
];

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about party boat fishing, booking trips, what to bring, and more.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  // FAQ structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

      {/* FAQ Accordion */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Accordion className="space-y-3">
            {FAQS.map((faq, index) => (
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
