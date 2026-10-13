"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { Lightbox } from "@/components/shared/lightbox";
import { CostEstimator } from "@/components/public/cost-estimator";
import { ReviewCarousel } from "@/components/public/review-coverflow";
import { photos } from "@/lib/images";
import { packagePrice } from "@/lib/format";
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
  const venueList = useDemoStore((state) => state.venues);
  const packageList = useDemoStore((state) => state.packages);
  const serviceList = useDemoStore((state) => state.services);
  const galleryList = useDemoStore((state) => state.gallery);
  const testimonialList = useDemoStore((state) => state.testimonials);
  const venues = useMemo(
    () => venueList.filter((venue) => venue.published && venue.featured).slice(0, 4),
    [venueList],
  );
  const packages = useMemo(
    () =>
      packageList
        .filter((item) => item.published && !item.archived)
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .slice(0, 6),
    [packageList],
  );
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
              Celebrate Moments. Create Experiences.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              You bring the people. We'll take care of the rest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={cn(publicButtonClass, "bg-white text-ink hover:bg-stone-100")}>
                <Link href="/venues">Explore Venues</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(publicButtonClass, "border-white/70 bg-transparent text-white hover:bg-white hover:text-ink")}
              >
                <Link href="/request-proposal">Request a Proposal</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Venues</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Rooms worth gathering in</h2>
            </div>
            <Button asChild variant="outline" className={publicButtonClass}>
              <Link href="/venues">
                All venues <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2">
            {venues.map((venue) => (
              <article key={venue.id} className="group flex h-full flex-col overflow-hidden bg-white">
                <Link href={`/venues/${venue.slug}`} className="block overflow-hidden">
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="aspect-[3/2] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl">{venue.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {venue.location} · {venue.minCapacity}–{venue.maxCapacity} guests
                      </p>
                    </div>
                    <p className="shrink-0 text-sm">
                      From <CurrencyDisplay value={venue.startingPrice} />
                    </p>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{venue.shortDescription}</p>
                  <Button asChild variant="outline" className={cn(publicButtonClass, "mt-5 w-fit")}>
                    <Link href={`/venues/${venue.slug}`}>View Venue</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 md:py-28">
        <Container>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Packages</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl md:text-5xl">Celebrations, already composed</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => {
              const current = packagePrice(item.price, item.salePrice);
              return (
                <article key={item.id} className="flex h-full flex-col border border-stone-200">
                  <img src={item.image} alt={item.name} className="aspect-[3/2] w-full object-cover" />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-3xl">{item.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{item.description}</p>
                    <p className="mt-4 text-sm">
                      From <CurrencyDisplay value={current} />
                      {item.salePrice ? (
                        <span className="ml-2 text-muted-foreground line-through">
                          <CurrencyDisplay value={item.price} />
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild className={publicButtonClass}>
                        <Link href={`/packages/${item.slug}`}>View Package</Link>
                      </Button>
                      <Button asChild variant="outline" className={publicButtonClass}>
                        <Link href={`/request-proposal?package=${item.slug}`}>Request Proposal</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
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
          <h2 className="font-display text-5xl md:text-6xl">Planning Your Next Event?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Tell us the date, the room, and the feeling you want. We will answer with a proposal, not a brochure.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className={cn(publicButtonClass, "bg-white text-ink hover:bg-stone-100")}>
              <Link href="/request-proposal">Request Proposal</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={cn(publicButtonClass, "border-white/70 bg-transparent text-white hover:bg-white hover:text-ink")}
            >
              <Link href="/packages">Explore Packages</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
