"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Anchor, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to resend email");
        return;
      }
      toast.success("Verification email sent!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Anchor className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-2xl text-primary">
              Party Boats USA
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-display font-bold mb-2">
            Check Your Email
          </h1>

          <p className="text-muted-foreground mb-2">
            We&apos;ve sent a verification link to
          </p>

          {email && (
            <p className="font-medium text-foreground mb-6">{email}</p>
          )}

          <p className="text-sm text-muted-foreground mb-8">
            Click the link in your email to verify your account. Once verified,
            you&apos;ll be automatically logged in to your Captain&apos;s Portal.
          </p>

          <div className="space-y-3">
            {email && (
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                Resend Verification Email
              </button>
            )}

            <Link
              href="/operator/login"
              className="block w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary">
            &larr; Back to Party Boats USA
          </Link>
        </p>
      </div>
    </div>
  );
}
