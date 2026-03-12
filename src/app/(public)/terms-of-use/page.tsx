import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Review the terms and conditions for using Party Boats USA. Understand your responsibilities, our disclaimer, and policies on user-generated content.",
  alternates: { canonical: "/terms-of-use" },
};

export default function TermsPage() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Terms of Use</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-sm">
          <h1 className="text-3xl font-display font-bold mb-8">Terms of Use</h1>

          <p className="text-muted-foreground mb-6">
            Last updated: January 1, 2025
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Party Boats USA (&quot;the Website&quot;), you accept and
            agree to be bound by these Terms of Use. If you do not agree to these
            terms, please do not use the Website.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            2. Description of Service
          </h2>
          <p>
            Party Boats USA is a directory and information platform that helps users
            find and compare party boat fishing charters across the United States. We
            do not operate any boats or charters ourselves. All bookings are made
            directly with the charter operators listed on our platform.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            3. User Responsibilities
          </h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Website only for lawful purposes</li>
            <li>Provide accurate information when submitting reviews, photos, or contact forms</li>
            <li>Not post false, misleading, or defamatory content</li>
            <li>Not attempt to disrupt or compromise the Website&apos;s functionality</li>
          </ul>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            4. Disclaimer
          </h2>
          <p>
            Party Boats USA provides information for reference purposes only. We do not
            guarantee the accuracy, completeness, or timeliness of any information on
            the Website. Charter operators are responsible for their own listings,
            pricing, availability, and services. We are not liable for any issues
            arising from your interactions with charter operators.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            5. User-Generated Content
          </h2>
          <p>
            By submitting reviews, photos, or other content to the Website, you grant
            Party Boats USA a non-exclusive, royalty-free license to use, display, and
            distribute that content on our platform. You retain ownership of your
            content but agree that we may moderate or remove content at our discretion.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            6. Limitation of Liability
          </h2>
          <p>
            Party Boats USA is not responsible for any injuries, losses, or damages
            arising from fishing trips booked through operators listed on our platform.
            Users participate in fishing activities at their own risk.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            7. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Continued
            use of the Website after changes are posted constitutes acceptance of the
            modified terms.
          </p>

          <h2 className="text-xl font-display font-bold mt-8 mb-4">
            8. Contact
          </h2>
          <p>
            If you have questions about these terms, please{" "}
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
