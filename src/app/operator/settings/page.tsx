"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Operator {
  id: number;
  email: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  tier: { name: string; badgeColor: string | null } | null;
}

export default function OperatorSettings() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/operator/profile")
      .then((r) => r.json())
      .then((data) => {
        setOperator(data);
        setCompanyName(data.companyName || "");
        setContactName(data.contactName || "");
        setPhone(data.phone || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/operator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, contactName, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      toast.success("Profile updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold">Profile Information</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={operator?.email || ""}
            disabled
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-gray-50 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium mb-1">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label htmlFor="contactName" className="block text-sm font-medium mb-1">
            Contact Name
          </label>
          <input
            id="contactName"
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </form>

      {/* Tier Info */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-3">Membership Plan</h2>
        {operator?.tier ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: operator.tier.badgeColor || "#004685" }}
              >
                {operator.tier.name}
              </span>
              <span className="text-sm text-muted-foreground">Current Plan</span>
            </div>
            <Link
              href="/operator/upgrade"
              className="text-sm text-primary hover:underline"
            >
              View Upgrade Options
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Free Plan</span>
            <Link
              href="/operator/upgrade"
              className="text-sm text-primary hover:underline"
            >
              Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
