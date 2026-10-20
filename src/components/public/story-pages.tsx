"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
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
        <p className="text-[11px] tracking-[0.22em] text-stone-500 uppercase">Services</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">The craft around the room</h1>
        <p className="mt-4 max-w-2xl text-stone-600">Coordination, catering, styling, and production for corporate events, team building, and private celebrations.</p>
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
              <div className="relative h-48 w-full sm:h-auto sm:min-h-full">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 180px"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-[11px] tracking-[0.22em] text-stone-500 uppercase">{service.category}</p>
                <h2 className="mt-2 font-display text-3xl">{service.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{service.description}</p>
                <Button asChild variant="outline" className={`mt-4 ${publicButtonClass}`}>
                  <Link href={`/request-proposal?service=${service.id}`} prefetch>
                    Request this service
                  </Link>
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
          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className="group flex h-full w-full flex-col text-left"
                onClick={() => setIndex(visible.findIndex((image) => image.id === item.id))}
              >
                <span className="block aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </span>
                <span className="mt-3 block text-sm leading-snug text-stone-600">{item.caption}</span>
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

