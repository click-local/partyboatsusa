import Link from "next/link";
import { Search, MapPin, Star, Anchor } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
            Find the Best Party Boat
            <br />
            Fishing Trips in the USA
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover and book top-rated headboats and open party fishing charters
            across the United States.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              Browse Boats
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              <MapPin className="h-5 w-5" />
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Search",
                description: "Browse party boats by location, price, and trip type.",
              },
              {
                icon: Star,
                title: "Compare",
                description: "Read reviews, view photos, and compare your options.",
              },
              {
                icon: Anchor,
                title: "Book",
                description: "Book directly with the operator for the best experience.",
              },
            ].map((step) => (
              <div key={step.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
