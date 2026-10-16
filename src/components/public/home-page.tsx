"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { Lightbox } from "@/components/shared/lightbox";
import { CostEstimator } from "@/components/public/cost-estimator";
import { ReviewCarousel } from "@/components/public/review-coverflow";
import { EVENT_RATES, RATE_GROUPS, shortRate } from "@/lib/event-rates";
import { photos } from "@/lib/images";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const reasons = [
  {
    title: "One team, every detail",
    copy: "Planning, styling, and the day itself stay with a single team, so the dinner matches the promise made in the proposal.",
  },
  {
    title: "Rooms with a point of view",
    copy: "Ballrooms, gardens, and boardrooms chosen for light, flow, and the number of people you are actually hosting.",
  },
  {
    title: "Quotations you can read",
    copy: "Every proposal is itemized. You see the venue, the package, the add-ons, and what is deliberately left out.",
  },
  {
    title: "A calm host on the day",
    copy: "Coordinators run the timing so speeches, meals, and dancing happen without anyone in your family managing a headset.",
  },
];

export function HomePage() {
  const settings = useDemoStore((state) => state.settings);
  const serviceList = useDemoStore((state) => state.services);
  const galleryList = useDemoStore((state) => state.gallery);
  const testimonialList = useDemoStore((state) => state.testimonials);
  const services = useMemo(() => serviceList.filter((service) => service.active).slice(0, 6), [serviceList]);
  const gallery = useMemo(() => galleryList.filter((item) => item.featured).slice(0, 6), [galleryList]);
  const testimonials = useMemo(
    () =>
      testimonialList
        .filter((item) => item.published)
        .sort((a, b) => Number(b.featured) - Number(a.featured)),
    [testimonialList],
  );
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div>
      <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden">
        <img
          src={photos.ballroom}
          alt="A candlelit ballroom set for a formal dinner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <Container className="relative flex min-h-[calc(100svh-5rem)] items-end py-16 md:items-center">
          <div className="rise max-w-2xl text-white">
            <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Singapore</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-7xl">
              An event shouldn’t cost an event.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Corporate gatherings, team building, dinners, and private celebrations. You bring the people. We take care of the rest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={cn(publicButtonClass, "bg-white text-ink hover:bg-stone-100")}>
                <Link href="/request-proposal">Request a quotation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(publicButtonClass, "border-white/70 bg-transparent text-white hover:bg-white hover:text-ink")}
              >
                <Link href="/services">View services</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">RSVPNow</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Events, handled from the first call to the last song.</h2>
          </div>
          <div>
            <p className="text-base leading-relaxed text-stone-600">{settings.companyDescription}</p>
            <p className="mt-4 text-sm leading-relaxed text-stone-500">
              The work is planned properly and priced so a company dinner or a family celebration stays within reach. Prices are indicative and subject to event requirements.
            </p>
            <Button asChild className={cn(publicButtonClass, "mt-8")}>
              <Link href="/request-proposal">Request a quotation</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-stone-200 bg-white py-16 md:py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Starting prices</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">
                From a figure you can read.
              </h2>
              <p className="mt-6 font-display text-3xl md:text-4xl">From S$35/pax</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
                Singapore dollars. Prices are indicative and subject to event requirements.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className={publicButtonClass}>
                  <Link href="/request-proposal">Request a quotation</Link>
                </Button>
                <Button asChild variant="outline" className={publicButtonClass}>
                  <Link href="/packages">See all prices</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6 border border-stone-200 bg-[#f7f6f4] p-5 md:p-7">
              {RATE_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{group.title}</p>
                  <ul className="mt-3">
                    {group.ids.map((id) => {
                      const rate = EVENT_RATES.find((item) => item.id === id);
                      if (!rate) return null;
                      return (
                        <li
                          key={rate.id}
                          className="flex items-baseline justify-between gap-3 border-b border-stone-200 py-2 last:border-b-0 last:pb-0"
                        >
                          <span className="text-sm leading-snug text-ink">{rate.shortName}</span>
                          <span className="shrink-0 text-sm tabular-nums text-stone-600">{shortRate(rate)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Services</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">What the evening is made of</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services#${service.slug}`}
                className="group relative aspect-[3/2] overflow-hidden"
              >
                <img src={service.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-3xl">{service.name}</h3>
                  <p className="text-xs tracking-[0.16em] uppercase text-white/80">{service.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-20 text-ivory md:py-28">
        <Container>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Why RSVPNow</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl md:text-5xl">Hospitality with a paper trail</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason.title} className="border-t border-white/15 pt-6">
                <h3 className="font-display text-3xl">{reason.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-300">{reason.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Gallery</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Evenings we have already hosted</h2>
            </div>
            <Button asChild variant="outline" className={cn(publicButtonClass, "hidden sm:inline-flex")}>
              <Link href="/gallery">Open gallery</Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="overflow-hidden text-left"
                onClick={() => setLightbox(index)}
              >
                <img src={item.src} alt={item.caption} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
          <Lightbox
            images={gallery.map((item) => ({ src: item.src, caption: item.caption }))}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onIndex={setLightbox}
          />
        </Container>
      </section>

      <section className="bg-white py-20 md:py-28">
        <Container>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Clients</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">In their words</h2>
          <div className="mt-10">
            <ReviewCarousel items={testimonials} />
          </div>
        </Container>
      </section>

      <CostEstimator />

      <section className="relative overflow-hidden py-24">
        <img src={photos.garden} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <Container className="relative text-center text-white">
          <h2 className="font-display text-5xl md:text-6xl">Planning your next event?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Tell us the date, the guest count, and what the evening needs. We reply with a quotation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className={cn(publicButtonClass, "bg-white text-ink hover:bg-stone-100")}>
              <Link href="/request-proposal">Request a quotation</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={cn(publicButtonClass, "border-white/70 bg-transparent text-white hover:bg-white hover:text-ink")}
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
