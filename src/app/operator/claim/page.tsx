"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Anchor, Loader2, Eye, EyeOff, ShieldCheck, Settings } from "lucide-react";
import { toast } from "sonner";

export default function ClaimListingPage() {
  return (
    <Suspense>
      <ClaimContent />
    </Suspense>
  );
}

function ClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boatId = searchParams.get("boatId");
  const boatName = searchParams.get("boatName");

  const [tab, setTab] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site/logo")
      .then((r) => r.json())
      .then((d) => setLogoUrl(d.logoUrl))
      .catch(() => {});
  }, []);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regContactName, setRegContactName] = useState("");
  const [regPhone, setRegPhone] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Welcome back!");
      const redirect = boatId
        ? `/operator/dashboard?claimBoatId=${boatId}`
        : "/operator/dashboard";
      window.location.href = redirect;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          companyName: regCompanyName,
          contactName: regContactName,
          phone: regPhone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      const params = new URLSearchParams({ email: regEmail });
      if (boatId) params.set("claimBoatId", boatId);
      router.push(`/operator/verify-email?${params.toString()}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {logoUrl ? (
              <Image src={logoUrl} alt="Party Boats USA" width={180} height={96} className="h-16 lg:h-24 w-auto mx-auto" />
            ) : (
              <div className="inline-flex items-center gap-2">
                <Anchor className="h-8 w-8 text-primary" />
                <span className="font-display font-bold text-2xl text-primary">Party Boats USA</span>
              </div>
            )}
          </Link>
        </div>

        {/* Claim Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h1 className="text-lg font-display font-bold text-blue-900 mb-1">
            Claim Your Listing
          </h1>
          {boatName && (
            <p className="text-sm font-medium text-blue-800 mb-3">
              {boatName}
            </p>
          )}
          <p className="text-sm text-blue-700 mb-4">
            Take control of your listing to update your information, respond to
            reviews, and attract more customers. Here&apos;s how it works:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Anchor className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  1. Create a free account or sign in
                </p>
                <p className="text-xs text-blue-600">
                  Quick setup, no credit card required
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  2. We verify your ownership
                </p>
                <p className="text-xs text-blue-600">
                  Our team reviews claims within 24 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Settings className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  3. Manage your listing
                </p>
                <p className="text-xs text-blue-600">
                  Update photos, respond to reviews, and more
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-border">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "login"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "register"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In & Claim Listing
              </button>
              <div className="text-center">
                <Link
                  href="/operator/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-company" className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <input
                  id="reg-company"
                  type="text"
                  required
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your Charter Company"
                />
              </div>
              <div>
                <label htmlFor="reg-contact" className="block text-sm font-medium mb-1">
                  Contact Name
                </label>
                <input
                  id="reg-contact"
                  type="text"
                  required
                  value={regContactName}
                  onChange={(e) => setRegContactName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Captain John"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showRegPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium mb-1">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="(555) 123-4567"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account & Claim Listing
              </button>
            </form>
          )}
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
