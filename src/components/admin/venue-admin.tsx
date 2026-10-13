"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminControlClass, Field, PageHeader } from "@/components/shared/chrome";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CurrencyDisplay } from "@/components/shared/currency";
import { ImageUploader, StringListEditor } from "@/components/shared/editors";
import { EVENT_TYPES, type Venue } from "@/lib/types";
import { formatPeso, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function VenueAdminList() {
  const venues = useDemoStore((state) => state.venues);
  const updateVenue = useDemoStore((state) => state.updateVenue);
  const deleteVenue = useDemoStore((state) => state.deleteVenue);
  const duplicateVenue = useDemoStore((state) => state.duplicateVenue);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const rooms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return venues.filter((venue) => !needle || `${venue.name} ${venue.location} ${venue.eventTypes.join(" ")}`.toLowerCase().includes(needle));
  }, [venues, query]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Rooms"
        title="Venues"
        description="Each card is a room on the public site. Unpublished rooms stay off the website."
        actions={<Button asChild className="bg-neutral-950 text-white hover:bg-neutral-800"><Link href="/admin/venues/new">Add venue</Link></Button>}
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a room or a city"
        aria-label="Search venues"
        className="h-11 max-w-md border-black/10 bg-white shadow-none"
      />
      {rooms.length === 0 ? (
        <p className="rounded-lg border border-black/5 bg-white px-5 py-10 text-sm text-neutral-500">No rooms match that search.</p>
      ) : (
        <div className="space-y-4">
          {rooms.map((venue) => (
            <article key={venue.id} className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm md:grid md:grid-cols-[18rem_1fr]">
              <Link href={`/admin/venues/${venue.id}`} className="relative block min-h-48">
                <img src={venue.images[0]} alt="" className="h-full min-h-48 w-full object-cover" />
                <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-neutral-950 uppercase">
                  {venue.published ? "On the site" : "Hidden"}
                </span>
              </Link>
              <div className="flex flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-400">{venue.location}{venue.featured ? " · Featured" : ""}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-950">{venue.name}</h2>
                  </div>
                  <p className="text-lg font-semibold text-neutral-950 tabular-nums">From {formatPeso(venue.startingPrice)}</p>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">{venue.shortDescription}</p>
                <p className="mt-3 text-sm text-neutral-950">{venue.minCapacity}–{venue.maxCapacity} guests · {venue.amenities.length} amenities</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {venue.eventTypes.map((type) => (
                    <span key={type} className="rounded-md bg-[#f4f5f7] px-2 py-1 text-xs text-neutral-600">{type}</span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                  <Button size="sm" variant="outline" asChild><Link href={`/admin/venues/${venue.id}`}>View</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link href={`/admin/venues/${venue.id}/edit`}>Edit</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => { const copy = duplicateVenue(venue.id); if (copy) { toast.success("Venue duplicated."); router.push(`/admin/venues/${copy.id}/edit`); } }}>Duplicate</Button>
                  <Button size="sm" variant="outline" onClick={() => { updateVenue(venue.id, { published: !venue.published }); toast.success(venue.published ? "Venue unpublished." : "Venue published."); }}>{venue.published ? "Unpublish" : "Publish"}</Button>
                  <Button size="sm" variant="destructive" onClick={() => setRemoveId(venue.id)}>Delete</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Delete venue?"
        description="This action will remove the venue from the demo."
        confirmLabel="Delete"
        destructive
        pending={pendingId != null}
        onConfirm={() => {
          if (!removeId) return;
          setPendingId(removeId);
          void wait(400).then(() => {
            deleteVenue(removeId);
            toast.success("Venue deleted.");
            setPendingId(null);
            setRemoveId(null);
          });
        }}
      />
    </div>
  );
}

export function VenueAdminDetail({ id }: { id: string }) {
  const venue = useDemoStore((state) => state.venues.find((item) => item.id === id));
  if (!venue) return <p>Venue not found.</p>;
  return (
    <div className="space-y-6">
      <PageHeader
        title={venue.name}
        description={venue.location}
        actions={
          <>
            <Button asChild variant="outline"><Link href={`/venues/${venue.slug}`}>View on website</Link></Button>
            <Button asChild><Link href={`/admin/venues/${venue.id}/edit`}>Edit</Link></Button>
          </>
        }
      />
      <img src={venue.images[0]} alt="" className="aspect-[3/2] w-full max-w-3xl object-cover" />
      <p className="max-w-3xl text-sm leading-relaxed">{venue.description}</p>
      <p>From <CurrencyDisplay value={venue.startingPrice} /> · {venue.minCapacity}–{venue.maxCapacity} guests</p>
    </div>
  );
}

export function VenueForm({ id }: { id?: string }) {
  const existing = useDemoStore((state) => state.venues.find((item) => item.id === id));
  const addVenue = useDemoStore((state) => state.addVenue);
  const updateVenue = useDemoStore((state) => state.updateVenue);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Omit<Venue, "id" | "slug">>(() => existing ? {
    name: existing.name,
    images: existing.images,
    shortDescription: existing.shortDescription,
    description: existing.description,
    location: existing.location,
    startingPrice: existing.startingPrice,
    minCapacity: existing.minCapacity,
    maxCapacity: existing.maxCapacity,
    amenities: existing.amenities,
    facilities: existing.facilities,
    eventTypes: existing.eventTypes,
    featured: existing.featured,
    published: existing.published,
  } : {
    name: "",
    images: [],
    shortDescription: "",
    description: "",
    location: "",
    startingPrice: 0,
    minCapacity: 20,
    maxCapacity: 100,
    amenities: [],
    facilities: [],
    eventTypes: [],
    featured: false,
    published: true,
  });

  async function save() {
    if (!form.name.trim() || !form.location.trim() || !form.description.trim()) {
      toast.error("Name, location, and description are required.");
      return;
    }
    setPending(true);
    await wait();
    if (existing) {
      updateVenue(existing.id, form);
      toast.success("Venue updated successfully.");
      router.push(`/admin/venues/${existing.id}`);
    } else {
      const created = addVenue(form);
      toast.success("Venue created successfully.");
      router.push(`/admin/venues/${created.id}`);
    }
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={existing ? "Edit venue" : "Add venue"} description="Changes are saved in this browser." />
      <div className="grid gap-4 border border-stone-200 bg-white p-5 md:grid-cols-2">
        <Field label="Venue name"><Input className={adminControlClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Location"><Input className={adminControlClass} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
        <Field label="Starting price"><Input type="number" className={adminControlClass} value={form.startingPrice} onChange={(event) => setForm({ ...form, startingPrice: Number(event.target.value) })} /></Field>
        <Field label="Minimum capacity"><Input type="number" className={adminControlClass} value={form.minCapacity} onChange={(event) => setForm({ ...form, minCapacity: Number(event.target.value) })} /></Field>
        <Field label="Maximum capacity"><Input type="number" className={adminControlClass} value={form.maxCapacity} onChange={(event) => setForm({ ...form, maxCapacity: Number(event.target.value) })} /></Field>
        <Field label="Short description"><Input className={adminControlClass} value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} /></Field>
        <div className="md:col-span-2">
          <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Amenities"><StringListEditor values={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} placeholder="Add an amenity" /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Facilities"><StringListEditor values={form.facilities} onChange={(facilities) => setForm({ ...form, facilities })} placeholder="Add a facility" /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Event types">
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const selected = form.eventTypes.includes(type);
                return (
                  <Button key={type} type="button" size="sm" variant={selected ? "default" : "outline"} onClick={() => setForm({ ...form, eventTypes: selected ? form.eventTypes.filter((item) => item !== type) : [...form.eventTypes, type] })}>
                    {type}
                  </Button>
                );
              })}
            </div>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Images"><ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} /></Field>
        </div>
        <label className="flex items-center justify-between border border-stone-200 p-3 text-sm">Featured <Switch checked={form.featured} onCheckedChange={(featured) => setForm({ ...form, featured })} /></label>
        <label className="flex items-center justify-between border border-stone-200 p-3 text-sm">Published <Switch checked={form.published} onCheckedChange={(published) => setForm({ ...form, published })} /></label>
      </div>
      <Button disabled={pending} onClick={() => void save()}>{pending ? "Saving..." : "Save venue"}</Button>
    </div>
  );
}
