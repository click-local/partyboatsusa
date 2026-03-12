import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Party Boats USA collects, uses, and protects your personal information. Read our privacy policy covering data collection, cookies, and your rights.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-sm">
          <h1 className="text-3xl font-display font-bold mb-8">Privacy Policy</h1>

          <p className="text-muted-foreground mb-6">
            Last updated: January 1, 2025
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information:</strong> Name, email address, and phone
              number when you submit a contact form, review, or photo.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, time spent on site, browser
              type, and referring website through analytics tools.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to improve your browsing
              experience and analyze site traffic.
            </li>
          </ul>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respond to your inquiries and contact form submissions</li>
            <li>Display your reviews and photos on the platform (with your consent)</li>
            <li>Improve our website and user experience</li>
            <li>Send occasional updates about Party Boats USA (with opt-in consent)</li>
            <li>Analyze website traffic and usage patterns</li>
          </ul>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            3. Information Sharing
          </h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties.
            We may share information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers who assist in operating our website</li>
            <li>Analytics providers (such as Google Analytics) in aggregated form</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            4. Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your personal
            information. However, no method of transmission over the Internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to your personal data</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of marketing communications</li>
            <li>Request removal of reviews or photos you submitted</li>
          </ul>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            6. Third-Party Links
          </h2>
          <p>
            Our website contains links to charter operator websites and other third
            parties. We are not responsible for the privacy practices of these external
            sites. We encourage you to review their privacy policies.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            7. Children&apos;s Privacy
          </h2>
          <p>
            Our website is not directed to children under 13. We do not knowingly
            collect personal information from children under 13. If you believe we
            have collected such information, please contact us.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            9. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
