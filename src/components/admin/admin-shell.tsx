"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Quote,
  ScrollText,
  Search,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSessionStore } from "@/lib/auth/session";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const navGroups = [
  [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  [
    { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    { href: "/admin/proposals", label: "Proposals", icon: FileText },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  ],
  [
    { href: "/admin/venues", label: "Venues", icon: Building2 },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/services", label: "Services", icon: Sparkles },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  ],
  [
    { href: "/admin/payments", label: "Payments", icon: Wallet },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/users", label: "Users", icon: UserCog },
    { href: "/admin/activity", label: "Activity", icon: ScrollText },
  ],
];

function itemActive(pathname: string, search: string, href: string) {
  const [path, query] = href.split("?");
  const current = new URLSearchParams(search);
  if (query) {
    const expected = new URLSearchParams(query);
    if (pathname !== path) return false;
    for (const [key, value] of expected.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  }
  if (path === "/admin") return pathname === "/admin";
  if (path === "/admin/inquiries") return pathname.startsWith("/admin/inquiries") && !current.get("status");
  return pathname === path || pathname.startsWith(`${path}/`);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const settings = useDemoStore((state) => state.settings);
  const session = useSessionStore((state) => state.session);
  const logout = useSessionStore((state) => state.logout);
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-[#111111] text-white">
      <div className="px-5 pt-6 pb-4">
        <Link href="/admin" onClick={onNavigate} className="text-lg font-bold tracking-tight">
          {settings.companyName}
        </Link>
        <p className="mt-1 text-[10px] tracking-[0.16em] text-white/40 uppercase">Admin</p>
      </div>
      <nav className="flex-1 overflow-auto px-3 pb-4">
        {navGroups.map((group, index) => (
          <div key={group[0].href} className={cn(index > 0 && "mt-2 border-t border-white/10 pt-2")}>
            {group.map((item) => {
              const Icon = item.icon;
              const active = itemActive(pathname, search, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white",
                    active && "bg-white/10 text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c4454d] text-sm font-semibold">
            {session?.name.slice(0, 1) ?? "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session?.name}</p>
            <p className="truncate text-xs text-white/45">{session?.role}</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white"
          onClick={() => {
            logout();
            toast.success("Signed out.");
            router.replace("/admin/login");
            onNavigate?.();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const ready = useSessionStore((state) => state.ready);
  const session = useSessionStore((state) => state.session);
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const data = useDemoStore();

  useEffect(() => {
    if (ready && !session) router.replace("/admin/login");
  }, [ready, session, router]);

  useEffect(() => {
    document.body.classList.add("admin-studio");
    return () => document.body.classList.remove("admin-studio");
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(
    () => [
      ...data.clients.map((item) => ({ href: `/admin/clients/${item.id}`, group: "Clients", label: item.name, hint: item.email })),
      ...data.inquiries.map((item) => ({ href: `/admin/inquiries/${item.id}`, group: "Inquiries", label: `${item.number} · ${item.fullName}`, hint: item.eventType })),
      ...data.proposals.map((item) => ({ href: `/admin/proposals/${item.id}`, group: "Proposals", label: item.number, hint: item.status })),
      ...data.bookings.map((item) => ({ href: `/admin/bookings/${item.id}`, group: "Bookings", label: `${item.number} · ${item.eventName}`, hint: item.eventDate })),
      ...data.venues.map((item) => ({ href: `/admin/venues/${item.id}`, group: "Venues", label: item.name, hint: item.location })),
      ...data.packages.map((item) => ({ href: `/admin/packages/${item.id}/edit`, group: "Packages", label: item.name, hint: item.eventType })),
    ],
    [data.clients, data.inquiries, data.proposals, data.bookings, data.venues, data.packages],
  );

  if (!ready || !session) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Checking access…</div>;
  }

  const grouped = ["Clients", "Inquiries", "Proposals", "Bookings", "Venues", "Packages"];

  return (
    <div className="min-h-screen bg-[#f4f5f7] md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="no-print hidden bg-[#111111] text-white md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="no-print flex items-center gap-3 px-4 pt-5 md:px-8">
          <Button variant="outline" size="icon" className="bg-white md:hidden" onClick={() => setMenu(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full max-w-sm items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-left text-sm text-neutral-400 shadow-sm"
          >
            <Search className="size-4" />
            Search
          </button>
        </header>
        <div className="px-4 py-6 md:px-8 md:pb-10">{children}</div>
      </div>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-64 bg-[#111111] p-0 text-white">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMenu(false)} />
        </SheetContent>
      </Sheet>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search" description="Search the studio">
        <Command>
          <CommandInput placeholder="Search clients, inquiries, proposals, bookings, venues, packages" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group} heading={group}>
                {results
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.group} ${item.label} ${item.hint}`}
                      onSelect={() => {
                        setSearchOpen(false);
                        router.push(item.href);
                      }}
                    >
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{item.hint}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
