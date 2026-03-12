"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X, Star, ArrowRight } from "lucide-react";
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
  { name: "Booking button", included: false },
  { name: "Social media links", included: false },
  { name: "Search boost", included: false },
];

const proFeatures = [
  { name: "Boat listing on Party Boats USA", included: true },
  { name: "Phone number displayed", included: true },
  { name: "Email displayed", included: true },
  { name: "Website link", included: true },
  { name: "Booking button", included: true },
  { name: "Social media links", included: true },
  { name: "Search boost (+10)", included: true },
];

const proRequirements = [
  "Complete your operator profile (company name, contact info, phone)",
  "Have at least one published boat listing",
  "Upload a high-quality primary photo for each boat",
  "Add a detailed description for each boat listing",
  "Maintain accurate pricing and availability information",
];

export default function UpgradePage() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operator/profile")
      .then((r) => r.json())
      .then(setOperator)
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

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
          Membership Tiers
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upgrade your listing by meeting the requirements below. All tiers are
          free — Pro status is earned by keeping your listing complete and up to
          date.
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
              Standard listing — available to all operators
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
            Enhanced
          </div>
          <div>
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-sm text-muted-foreground">
              Full visibility — earned by meeting requirements
            </p>
          </div>
          <div>
            <span className="text-3xl font-bold">Free</span>
            <span className="text-muted-foreground text-sm ml-1">
              (requirements-based)
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
          ) : (
            <div className="pt-2">
              <a
                href="mailto:support@partyboatsusa.com?subject=Pro%20Tier%20Upgrade%20Request"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Request Upgrade <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Pro Requirements */}
      {!isPro && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-display font-bold">
            How to Earn Pro Status
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete the following requirements and contact us to upgrade your
            listing to Pro. Our team will review your account and activate Pro
            features.
          </p>
          <ol className="space-y-3">
            {proRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{req}</span>
              </li>
            ))}
          </ol>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Once you&apos;ve met these requirements, email us at{" "}
              <a
                href="mailto:support@partyboatsusa.com?subject=Pro%20Tier%20Upgrade%20Request"
                className="text-primary hover:underline font-medium"
              >
                support@partyboatsusa.com
              </a>{" "}
              and we&apos;ll upgrade your account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
