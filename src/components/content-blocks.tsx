import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/link-button";
import { BoatCard } from "@/components/boat-card";
import { formatImageUrl } from "@/lib/utils";
import type { SelectContentBlock, SelectBoat } from "@/lib/db/schema";

interface ContentBlockProps {
  block: SelectContentBlock;
  boats?: SelectBoat[];
}

interface TextBlockContent {
  heading?: string;
  body?: string;
}

interface ImageBlockContent {
  imageUrl?: string;
  alt?: string;
  caption?: string;
}

interface GalleryBlockContent {
  heading?: string;
  images?: Array<{ url: string; alt?: string }>;
}

interface LinksBlockContent {
  heading?: string;
  links?: Array<{ label: string; url: string }>;
}

interface CtaBlockContent {
  heading?: string;
  body?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface BoatsBlockContent {
  heading?: string;
  limit?: number;
  sortBy?: string;
}

function sortBoats(boats: SelectBoat[], sortBy: string): SelectBoat[] {
  const sorted = [...boats];
  switch (sortBy) {
    case "price_low":
      return sorted.sort((a, b) => Number(a.minPricePerPerson || 0) - Number(b.minPricePerPerson || 0));
    case "price_high":
      return sorted.sort((a, b) => Number(b.minPricePerPerson || 0) - Number(a.minPricePerPerson || 0));
    case "name":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "capacity":
      return sorted.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    case "rating":
    default:
      return sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }
}

export function ContentBlockRenderer({ block, boats }: ContentBlockProps) {
  const content = block.content as Record<string, unknown>;

  switch (block.blockType) {
    case "text": {
      const data = content as TextBlockContent;
      return (
        <div className="prose prose-sm max-w-none">
          {data.heading && (
            <h2 className="text-2xl font-display font-bold mb-3">{data.heading}</h2>
          )}
          {data.body && (
            <div className="text-foreground whitespace-pre-line">{data.body}</div>
          )}
        </div>
      );
    }

    case "image": {
      const data = content as ImageBlockContent;
      if (!data.imageUrl) return null;
      return (
        <figure>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={formatImageUrl(data.imageUrl)}
              alt={data.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          {data.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "gallery": {
      const data = content as GalleryBlockContent;
      if (!data.images?.length) return null;
      return (
        <div>
          {data.heading && (
            <h2 className="text-2xl font-display font-bold mb-4">{data.heading}</h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.images.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={formatImageUrl(img.url)}
                  alt={img.alt || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "links": {
      const data = content as LinksBlockContent;
      if (!data.links?.length) return null;
      return (
        <div>
          {data.heading && (
            <h2 className="text-2xl font-display font-bold mb-3">{data.heading}</h2>
          )}
          <ul className="space-y-2">
            {data.links.map((link, i) => (
              <li key={i}>
                <Link href={link.url} className="text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "cta": {
      const data = content as CtaBlockContent;
      return (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-8 text-center">
          {data.heading && (
            <h2 className="text-2xl font-display font-bold mb-2">{data.heading}</h2>
          )}
          {data.body && (
            <p className="text-muted-foreground mb-4">{data.body}</p>
          )}
          {data.buttonUrl && (
            <LinkButton href={data.buttonUrl}>
              {data.buttonText || "Learn More"}
            </LinkButton>
          )}
        </div>
      );
    }

    case "boats": {
      const data = content as BoatsBlockContent;
      if (!boats || boats.length === 0) {
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No party boats listed yet. Check back soon!</p>
          </div>
        );
      }
      let displayBoats = sortBoats(boats, data.sortBy || "rating");
      if (data.limit && data.limit > 0) {
        displayBoats = displayBoats.slice(0, data.limit);
      }
      return (
        <section>
          {data.heading && (
            <h2 className="text-2xl font-display font-bold mb-6">
              {data.heading}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({displayBoats.length})
              </span>
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBoats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
