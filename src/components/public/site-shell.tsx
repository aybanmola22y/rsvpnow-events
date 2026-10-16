"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings = useDemoStore((state) => state.settings);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ivory text-ink">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-ivory/90 backdrop-blur-md">
        <Container className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <span className="block font-display text-2xl leading-none tracking-tight md:text-3xl">
              {settings.companyName}
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.22em] text-gold uppercase">Events by Nova North</span>
          </Link>
          <nav className="hidden items-center gap-5 xl:gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
              <Link href="/request-proposal">Request a quotation</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-ivory">
                <SheetHeader>
                  <SheetTitle className="font-display text-3xl">{settings.companyName}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="border-b border-stone-200 py-2 text-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button asChild className={publicButtonClass}>
                    <Link href="/request-proposal" onClick={() => setOpen(false)}>
                      Request a quotation
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink text-ivory">
        <Container className="grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-4xl">{settings.companyName}</p>
            <p className="mt-3 font-display text-2xl text-stone-200">An event shouldn’t cost an event.</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">{settings.companyDescription}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-gold uppercase">Visit</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-stone-300">
              <Link href="/services" className="hover:text-white">Services</Link>
              <Link href="/gallery" className="hover:text-white">Gallery</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/request-proposal" className="hover:text-white">Request a quotation</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] text-gold uppercase">Contact</p>
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
        <div className="border-t border-white/10">
          <Container className="flex flex-col gap-2 py-5 text-xs text-stone-400 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
            <Link href="/admin/login" className="hover:text-white">Staff login</Link>
          </Container>
        </div>
      </footer>
    </div>
  );
}
