"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { BrandMark } from "@/components/public/brand-mark";
import { RoutePrefetch } from "@/components/public/route-prefetch";
import { SmoothScroll } from "@/components/public/smooth-scroll";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-full origin-center bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "top-[6px] rotate-45" : "top-0 rotate-0",
        )}
      />
      <span
        className={cn(
          "absolute top-[6px] left-0 block h-[1.5px] w-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-full origin-center bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "top-[6px] -rotate-45" : "top-[12px] rotate-0",
        )}
      />
    </span>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings = useDemoStore((state) => state.settings);
  const [open, setOpen] = useState(false);

  return (
    <SmoothScroll>
    <div className="flex min-h-screen flex-col bg-ivory text-ink">
      <RoutePrefetch />
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <Container className="flex h-20 items-center justify-between gap-4">
          <Link href="/" prefetch className="min-w-0">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-5 xl:gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "text-lg text-stone-600 transition hover:text-ink",
                  isActive(pathname, link.href) && "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild className={cn(publicButtonClass, "hidden sm:inline-flex")}>
              <Link href="/request-proposal" prefetch>
                Request a quotation
              </Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden transition-transform duration-300 active:scale-95"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                >
                  <BurgerIcon open={open} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                showCloseButton={false}
                className="gap-0 bg-white duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right"
              >
                <SheetHeader className="border-b border-stone-100 pb-4">
                  <div className="flex items-center justify-between gap-3 pr-1">
                    <SheetTitle className="text-left">
                      <BrandMark />
                    </SheetTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Close menu"
                      className="shrink-0 transition-transform duration-300 active:scale-95"
                      onClick={() => setOpen(false)}
                    >
                      <BurgerIcon open />
                    </Button>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col px-4 pt-2">
                  {links.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: open ? `${80 + index * 60}ms` : "0ms" }}
                      className={cn(
                        "border-b border-stone-200 py-4 text-2xl font-display tracking-tight transition hover:text-stone-500",
                        open && "animate-menu-link",
                        isActive(pathname, link.href) && "text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div
                    style={{ animationDelay: open ? `${80 + links.length * 60}ms` : "0ms" }}
                    className={cn("pt-6", open && "animate-menu-link")}
                  >
                    <Button asChild className={cn(publicButtonClass, "w-full")}>
                      <Link href="/request-proposal" onClick={() => setOpen(false)}>
                        Request a quotation
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink text-ivory">
        <Container className="grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <BrandMark inverted markClassName="h-10 md:h-12" />
            <p className="mt-4 font-display text-2xl text-stone-200">An event shouldn’t cost an event.</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">{settings.companyDescription}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-stone-400 uppercase">Visit</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-stone-300">
              <Link href="/services" className="hover:text-white">Services</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/track" className="hover:text-white">Track quotation</Link>
              <Link href="/request-proposal" className="hover:text-white">Request a quotation</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-stone-400 uppercase">Contact</p>
            <div className="mt-4 space-y-2 text-sm text-stone-300">
              <p>{settings.address}</p>
              <a className="block hover:text-white" href={`mailto:${settings.email}`}>{settings.email}</a>
              {settings.phone ? <a className="block hover:text-white" href={`tel:${settings.phone}`}>{settings.phone}</a> : null}
              {settings.website ? <a className="block hover:text-white" href={settings.website} target="_blank" rel="noreferrer">{settings.website.replace(/^https?:\/\//, "")}</a> : null}
              <p>{settings.businessHours}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                {settings.instagram ? <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a> : null}
                {settings.facebook ? <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a> : null}
                {settings.tiktok ? <a href={settings.tiktok} target="_blank" rel="noreferrer" className="hover:text-white">TikTok</a> : null}
                {settings.youtube ? <a href={settings.youtube} target="_blank" rel="noreferrer" className="hover:text-white">YouTube</a> : null}
              </div>
            </div>
          </div>
        </Container>
        <Container className="flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-stone-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-white">Staff login</Link>
        </Container>
      </footer>
    </div>
    </SmoothScroll>
  );
}
