import { localBusinessJsonLd } from "@/lib/seo";

/** Server-rendered JSON-LD for Google rich results / local business understanding. */
export function LocalBusinessJsonLd() {
  const data = localBusinessJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
