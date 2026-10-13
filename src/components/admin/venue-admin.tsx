"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminControlClass, Field, PageHeader } from "@/components/shared/chrome";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CurrencyDisplay } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { ImageUploader, StringListEditor } from "@/components/shared/editors";
import { StatusBadge } from "@/components/shared/status-badge";
import { EVENT_TYPES, type Venue } from "@/lib/types";
import { wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function VenueAdminList() {
  const venues = useDemoStore((state) => state.venues);
  const updateVenue = useDemoStore((state) => state.updateVenue);
  const deleteVenue = useDemoStore((state) => state.deleteVenue);
  const duplicateVenue = useDemoStore((state) => state.duplicateVenue);
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Venues"
        description="Rooms published here appear on the public website."
        actions={<Button asChild><Link href="/admin/venues/new">Add Venue</Link></Button>}
      />
      <DataTable
        rows={venues}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.name} ${row.location} ${row.eventTypes.join(" ")}`}
        searchPlaceholder="Search venues"
        emptyTitle="No venues found"
        emptyDescription="Add a venue to show it on the public site."
        emptyAction={<Button asChild><Link href="/admin/venues/new">Add Venue</Link></Button>}
        columns={[
          { key: "name", header: "Venue", sortValue: (row) => row.name, cell: (row) => <span className="font-medium">{row.name}</span> },
          { key: "location", header: "Location", sortValue: (row) => row.location, cell: (row) => row.location },
          { key: "capacity", header: "Capacity", sortValue: (row) => row.maxCapacity, cell: (row) => `${row.minCapacity}–${row.maxCapacity}` },
          { key: "price", header: "Starting Price", sortValue: (row) => row.startingPrice, cell: (row) => <CurrencyDisplay value={row.startingPrice} /> },
          { key: "status", header: "Status", sortValue: (row) => (row.published ? "Published" : "Unpublished"), cell: (row) => <StatusBadge status={row.published ? "Published" : "Unpublished"} /> },
          { key: "featured", header: "Featured", cell: (row) => row.featured ? "Yes" : "No" },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <Button size="sm" variant="outline" asChild><Link href={`/admin/venues/${row.id}`}>View</Link></Button>
                <Button size="sm" variant="outline" asChild><Link href={`/admin/venues/${row.id}/edit`}>Edit</Link></Button>
                <Button size="sm" variant="outline" onClick={() => { const copy = duplicateVenue(row.id); if (copy) { toast.success("Venue duplicated."); router.push(`/admin/venues/${copy.id}/edit`); } }}>Duplicate</Button>
                <Button size="sm" variant="outline" onClick={() => { updateVenue(row.id, { published: !row.published }); toast.success(row.published ? "Venue unpublished." : "Venue published."); }}>{row.published ? "Unpublish" : "Publish"}</Button>
                <Button size="sm" variant="destructive" onClick={() => setRemoveId(row.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
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
