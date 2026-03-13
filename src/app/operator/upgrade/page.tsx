"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Check,
  X,
  Star,
  CalendarSync,
  Globe,
  Zap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Operator {
  id: number;
  tier: { id: number; name: string } | null;
}

const basicFeatures = [
  { name: "Boat listing on Party Boats USA", included: true },
  { name: "Phone number displayed", included: true },
  { name: "Email displayed", included: true },
  { name: "Website link", included: false },
  { name: "Direct booking from your listing", included: false },
  { name: "Social media links", included: false },
  { name: "Search priority boost", included: false },
  { name: "Pro Captain badge", included: false },
  { name: "Photo gallery", included: false },
  { name: "Brag Board on listing", included: false },
  { name: "Reply to reviews", included: false },
];

const proFeatures = [
  { name: "Everything in Basic", included: true },
  { name: "Website link", included: true },
  { name: "Direct booking from your listing", included: true },
  { name: "Social media links", included: true },
  { name: "Search priority boost", included: true },
  { name: "Pro Captain badge on your listing", included: true },
  { name: "Photo gallery on your listing", included: true },
  { name: "Customer catches (Brag Board) on your listing", included: true },
  { name: "Respond to customer reviews", included: true },
];

export default function UpgradePage() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/operator/profile")
      .then((r) => r.json())
      .then(setOperator)
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgradeRequest(hasGoFishAccount: boolean) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/operator/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasGoFishAccount }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      toast.success("Upgrade request submitted! We'll be in touch shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTier = operator?.tier?.name || "Basic";
  const isPro = currentTier === "Pro";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">
          Upgrade to Pro
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Let customers book directly from your Party Boats USA listing.
          Pro status is free. Just link your GoFish account and we handle the rest.
        </p>
      </div>

      {/* Current Tier Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Your current tier</p>
        <p className="text-xl font-bold text-primary">{currentTier}</p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Tier */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 ${!isPro ? "border-primary border-2" : "border-border"}`}>
          <div>
            <h3 className="text-lg font-semibold">Basic</h3>
            <p className="text-sm text-muted-foreground">
              Get discovered by anglers searching for party boats
            </p>
          </div>
          <div>
            <span className="text-3xl font-bold">Free</span>
          </div>
          <ul className="space-y-2 text-sm">
            {basicFeatures.map((f) => (
              <li key={f.name} className="flex items-center gap-2">
                {f.included ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={f.included ? "" : "text-muted-foreground"}>
                  {f.name}
                </span>
              </li>
            ))}
          </ul>
          {!isPro && (
            <div className="pt-2">
              <span className="inline-block w-full text-center py-2 border border-primary rounded-lg text-sm text-primary font-medium">
                Current Tier
              </span>
            </div>
          )}
        </div>

        {/* Pro Tier */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 relative ${isPro ? "border-primary border-2" : "border-border"}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="h-3 w-3" />
            Recommended
          </div>
          <div>
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-sm text-muted-foreground">
              Accept bookings directly from your listing
            </p>
          </div>
          <div>
            <span className="text-3xl font-bold">Free</span>
            <span className="text-muted-foreground text-sm ml-1">
              with GoFish
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            {proFeatures.map((f) => (
              <li key={f.name} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="pt-2">
              <span className="inline-block w-full text-center py-2 border border-primary rounded-lg text-sm text-primary font-medium">
                Current Tier
              </span>
            </div>
          ) : submitted ? (
            <div className="pt-2">
              <div className="flex items-center justify-center gap-2 w-full bg-green-50 text-green-700 py-3 rounded-lg text-sm font-medium border border-green-200">
                <CheckCircle className="h-4 w-4" />
                Request submitted! We&apos;ll be in touch soon.
              </div>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleUpgradeRequest(true)}
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "I Have a GoFish Account"
                )}
              </button>
              <button
                onClick={() => handleUpgradeRequest(false)}
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full border border-primary text-primary py-2.5 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "I Need a Free GoFish Account"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      {!isPro && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <h2 className="text-xl font-display font-bold">
            How Pro Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">We Do the Heavy Lifting</h3>
              <p className="text-sm text-muted-foreground">
                Once you have a GoFish account, our team will link and integrate
                it for you. Customers can then book directly from your Party Boats USA listing.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarSync className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Works With Your Existing Setup</h3>
              <p className="text-sm text-muted-foreground">
                Already using another booking platform on your website? No problem.
                GoFish offers two-way sync with Google Calendar so nothing conflicts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">No Changes to Your Website</h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t need to add anything to your personal website.
                Bookings happen right here on Party Boats USA through your listing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About GoFish */}
      {!isPro && (
        <div className="bg-gray-50 rounded-xl border p-6 space-y-3">
          <h2 className="text-lg font-display font-bold">
            About GoFish
          </h2>
          <p className="text-sm text-muted-foreground">
            Party Boats USA partners with{" "}
            <a
              href="https://GoFishVIP.com"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline font-medium"
            >
              GoFish
            </a>{" "}
            to power direct bookings on our platform. GoFish is a booking and
            management platform built specifically for fishing charter operators.
            It handles online reservations, payments, waivers, and customer
            communication, all in one place. By linking your GoFish account,
            anglers browsing Party Boats USA can book your trips instantly without
            leaving your listing.
          </p>
          <p className="text-sm text-muted-foreground">
            You can learn more or create an account at{" "}
            <a
              href="https://GoFishVIP.com"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              GoFishVIP.com <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
