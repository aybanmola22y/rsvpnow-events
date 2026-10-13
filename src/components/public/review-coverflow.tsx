"use client";

import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReviewCarousel({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <style>{`
        @keyframes review-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .review-track {
          animation: review-marquee 40s linear infinite;
        }
        .review-track:hover,
        .review-track:focus-within {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .review-track { animation: none; }
        }
      `}</style>
      <div className="review-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 gap-6 pr-6" aria-hidden={copy === 1}>
            {items.map((item) => (
              <li key={`${item.id}-${copy}`} className="w-[min(26rem,78vw)] shrink-0">
                <figure className={cn("flex h-full flex-col border border-stone-200 bg-white p-6")}>
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="size-12 rounded-full object-cover" />
                    <figcaption>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </figcaption>
                  </div>
                  <blockquote className="mt-5 flex-1 font-display text-2xl leading-snug">“{item.quote}”</blockquote>
                </figure>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
