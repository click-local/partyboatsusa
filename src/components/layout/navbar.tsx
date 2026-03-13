"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, Anchor, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/search", label: "Browse Boats", icon: Search },
  { href: "/destinations", label: "Browse Destinations" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/brag-board", label: "Brag Board" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Party Boats USA" className="h-12 md:h-16 lg:h-24 w-auto" />
            ) : (
              <>
                <Anchor className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-lg text-primary">
                  Party Boats USA
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/operator/login"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Captain&apos;s Portal
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-primary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-base font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/operator/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 px-4 py-3 rounded-lg text-base font-medium bg-primary text-white text-center hover:bg-primary/90"
            >
              Captain&apos;s Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
