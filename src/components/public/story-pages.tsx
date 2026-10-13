"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { Lightbox } from "@/components/shared/lightbox";
import { useDemoStore } from "@/lib/store/demo-store";

export function ServicesPage() {
  const serviceList = useDemoStore((state) => state.services);
  const services = useMemo(() => serviceList.filter((service) => service.active), [serviceList]);
  const categories = ["All", ...Array.from(new Set(services.map((service) => service.category)))];
  const [category, setCategory] = useState("All");
  const visible = services.filter((service) => category === "All" || service.category === category);

  return (
    <div className="py-16">
      <Container>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Services</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">The craft around the room</h1>
        <p className="mt-4 max-w-2xl text-stone-600">Coordination, catering, styling, and production, priced the way each service is actually sold.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button key={item} type="button" variant={item === category ? "default" : "outline"} onClick={() => setCategory(item)}>
              {item}
            </Button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {visible.map((service) => (
            <article id={service.slug} key={service.id} className="grid overflow-hidden bg-white sm:grid-cols-[180px_1fr]">
              <img src={service.image} alt="" className="h-48 w-full object-cover sm:h-full" />
              <div className="p-6">
                <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{service.category}</p>
                <h2 className="mt-2 font-display text-3xl">{service.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{service.description}</p>
                <p className="mt-4 text-sm">From <CurrencyDisplay value={service.price} /> · {service.pricingType}</p>
                <Button asChild variant="outline" className={`mt-4 ${publicButtonClass}`}>
                  <Link href={`/request-proposal?service=${service.id}`}>Request this service</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}

export function GalleryPage() {
  const gallery = useDemoStore((state) => state.gallery);
  const categories = ["All", ...Array.from(new Set(gallery.map((item) => item.category)))];
  const [category, setCategory] = useState("All");
  const [index, setIndex] = useState<number | null>(null);
  const visible = useMemo(
    () => gallery.filter((item) => category === "All" || item.category === category),
    [gallery, category],
  );

  return (
    <div className="py-16">
      <Container>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Gallery</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">A record of the room</h1>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button key={item} type="button" variant={item === category ? "default" : "outline"} onClick={() => setCategory(item)}>
              {item}
            </Button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No photographs in this category yet.</p>
        ) : (
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mb-4 block w-full break-inside-avoid"
                onClick={() => setIndex(visible.findIndex((image) => image.id === item.id))}
              >
                <img src={item.src} alt={item.caption} className="w-full object-cover" />
                <span className="mt-2 block text-left text-sm text-stone-600">{item.caption}</span>
              </button>
            ))}
          </div>
        )}
        <Lightbox
          images={visible.map((item) => ({ src: item.src, caption: item.caption }))}
          index={index}
          onClose={() => setIndex(null)}
          onIndex={setIndex}
        />
      </Container>
    </div>
  );
}

export function AboutPage() {
  const settings = useDemoStore((state) => state.settings);
  return (
    <div>
      <Container className="grid items-center gap-10 py-16 lg:grid-cols-2">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">About</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">You bring the people.</h1>
          <p className="mt-6 text-base leading-relaxed text-stone-600">{settings.companyDescription}</p>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Whether it is an intimate gathering or a large-scale celebration, RSVPNow makes every event uniquely yours. We'll take care of the rest.
          </p>
        </div>
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80" alt="A wedding celebration" className="h-[480px] w-full object-cover" />
      </Container>
      <section className="bg-white py-16">
        <Container className="grid gap-8 md:grid-cols-3">
          {[
            ["Ava Mendoza", "Principal", "Sets the standard and signs every proposal before it goes out."],
            ["Marco Santos", "Events", "Runs ingress, timing, and the quiet problems that should never reach the host."],
            ["Liza Cruz", "Clients", "The first conversation, the site visit, and the quotation you can actually compare."],
          ].map(([name, role, copy]) => (
            <div key={name}>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{role}</p>
              <h2 className="mt-2 font-display text-3xl">{name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{copy}</p>
            </div>
          ))}
        </Container>
      </section>
      <Container className="py-16">
        <Button asChild className={publicButtonClass}><Link href="/contact">Talk to RSVPNow</Link></Button>
      </Container>
    </div>
  );
}
