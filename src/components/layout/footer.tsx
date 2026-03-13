import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#1a2332] text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Image
              src="/images/footer-logo.png"
              alt="Party Boats USA"
              width={180}
              height={48}
              className="mb-4"
            />
            <p className="text-sm text-gray-400">
              Find the best party boat fishing trips across the United States.
              Compare prices, read reviews, and book your next adventure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Browse Boats</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Browse Destinations</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/brag-board" className="hover:text-white transition-colors">Brag Board</Link></li>
            </ul>
          </div>

          {/* For Operators */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">For Operators</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/operator/login" className="hover:text-white transition-colors">Captain&apos;s Portal</Link></li>
              <li><Link href="/operator/login" className="hover:text-white transition-colors">List Your Boat</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Party Boats USA. All rights reserved.
          </p>
          <a
            href="https://GoFishVIP.com"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="/images/gofish-footer.png"
              alt="Powered by GoFish"
              width={140}
              height={32}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
