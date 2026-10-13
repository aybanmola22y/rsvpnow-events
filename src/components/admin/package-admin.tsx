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
import { EVENT_TYPES, type EventPackage } from "@/lib/types";
import { packagePrice, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function PackageAdminList() {
  const packages = useDemoStore((state) => state.packages);
  const updatePackage = useDemoStore((state) => state.updatePackage);
  const deletePackage = useDemoStore((state) => state.deletePackage);
  const duplicatePackage = useDemoStore((state) => state.duplicatePackage);
  const router = useRouter();
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Packages" description="Public prices come from this list." actions={<Button asChild><Link href="/admin/packages/new">Add Package</Link></Button>} />
      <DataTable
        rows={packages}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.name} ${row.eventType}`}
        searchPlaceholder="Search packages"
        emptyTitle="No packages found"
        emptyDescription="Create a package to offer it on the website."
        emptyAction={<Button asChild><Link href="/admin/packages/new">Add Package</Link></Button>}
        columns={[
          { key: "name", header: "Package", sortValue: (row) => row.name, cell: (row) => row.name },
          { key: "type", header: "Event", sortValue: (row) => row.eventType, cell: (row) => row.eventType },
          { key: "price", header: "Price", sortValue: (row) => packagePrice(row.price, row.salePrice), cell: (row) => <CurrencyDisplay value={packagePrice(row.price, row.salePrice)} /> },
          { key: "guests", header: "Guests", sortValue: (row) => row.guestCapacity, cell: (row) => row.guestCapacity },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.archived ? "ARCHIVED" : row.published ? "Published" : "Unpublished"} /> },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <Button size="sm" variant="outline" asChild><Link href={`/packages/${row.slug}`}>View</Link></Button>
                <Button size="sm" variant="outline" asChild><Link href={`/admin/packages/${row.id}/edit`}>Edit</Link></Button>
                <Button size="sm" variant="outline" onClick={() => { const copy = duplicatePackage(row.id); if (copy) { toast.success("Package duplicated."); router.push(`/admin/packages/${copy.id}/edit`); } }}>Duplicate</Button>
                <Button size="sm" variant="outline" onClick={() => { updatePackage(row.id, { archived: !row.archived, published: row.archived ? row.published : false }); toast.success(row.archived ? "Package restored." : "Package archived."); }}>{row.archived ? "Restore" : "Archive"}</Button>
                <Button size="sm" variant="outline" onClick={() => { updatePackage(row.id, { published: !row.published, archived: false }); toast.success(row.published ? "Package unpublished." : "Package published."); }}>{row.published ? "Unpublish" : "Publish"}</Button>
                <Button size="sm" variant="destructive" onClick={() => setRemoveId(row.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Delete Package?"
        description="This action will remove the package from the demo."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!removeId) return;
          deletePackage(removeId);
          toast.success("Package deleted.");
          setRemoveId(null);
        }}
      />
    </div>
  );
}

export function PackageForm({ id }: { id?: string }) {
  const existing = useDemoStore((state) => state.packages.find((item) => item.id === id));
  const venues = useDemoStore((state) => state.venues);
  const services = useDemoStore((state) => state.services);
  const addPackage = useDemoStore((state) => state.addPackage);
  const updatePackage = useDemoStore((state) => state.updatePackage);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Omit<EventPackage, "id" | "slug">>(() => existing ? { ...existing } : {
    name: "",
    description: "",
    image: "",
    price: 0,
    salePrice: null,
    guestCapacity: 100,
    inclusions: [],
    exclusions: [],
    venueIds: [],
    serviceIds: [],
    eventType: "Wedding",
    featured: false,
    published: true,
    archived: false,
  });

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function save() {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required.");
      return;
    }
    setPending(true);
    await wait();
    const payload = { ...form, salePrice: form.salePrice && form.salePrice > 0 ? form.salePrice : null };
    if (existing) {
      updatePackage(existing.id, payload);
      toast.success("Package updated successfully.");
    } else {
      addPackage(payload);
      toast.success("Package created successfully.");
    }
    setPending(false);
    router.push("/admin/packages");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={existing ? "Edit package" : "Add package"} />
      <div className="grid gap-4 border border-stone-200 bg-white p-5 md:grid-cols-2">
        <Field label="Package name"><Input className={adminControlClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Event type">
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <Button key={type} type="button" size="sm" variant={form.eventType === type ? "default" : "outline"} onClick={() => setForm({ ...form, eventType: type })}>{type}</Button>
            ))}
          </div>
        </Field>
        <div className="md:col-span-2"><Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field></div>
        <Field label="Price"><Input type="number" className={adminControlClass} value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></Field>
        <Field label="Sale price" hint="Leave 0 for no discount"><Input type="number" className={adminControlClass} value={form.salePrice ?? 0} onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })} /></Field>
        <Field label="Guest capacity"><Input type="number" className={adminControlClass} value={form.guestCapacity} onChange={(event) => setForm({ ...form, guestCapacity: Number(event.target.value) })} /></Field>
        <div className="md:col-span-2"><Field label="Inclusions"><StringListEditor values={form.inclusions} onChange={(inclusions) => setForm({ ...form, inclusions })} placeholder="Add an inclusion" /></Field></div>
        <div className="md:col-span-2"><Field label="Exclusions"><StringListEditor values={form.exclusions} onChange={(exclusions) => setForm({ ...form, exclusions })} placeholder="Add an exclusion" /></Field></div>
        <div className="md:col-span-2">
          <Field label="Available venues">
            <div className="flex flex-wrap gap-2">{venues.map((venue) => <Button key={venue.id} type="button" size="sm" variant={form.venueIds.includes(venue.id) ? "default" : "outline"} onClick={() => setForm({ ...form, venueIds: toggle(form.venueIds, venue.id) })}>{venue.name}</Button>)}</div>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Available services">
            <div className="flex flex-wrap gap-2">{services.map((service) => <Button key={service.id} type="button" size="sm" variant={form.serviceIds.includes(service.id) ? "default" : "outline"} onClick={() => setForm({ ...form, serviceIds: toggle(form.serviceIds, service.id) })}>{service.name}</Button>)}</div>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Image">
            <ImageUploader multiple={false} images={form.image ? [form.image] : []} onChange={(images) => setForm({ ...form, image: images[0] ?? "" })} />
          </Field>
        </div>
        <label className="flex items-center justify-between border border-stone-200 p-3 text-sm">Featured <Switch checked={form.featured} onCheckedChange={(featured) => setForm({ ...form, featured })} /></label>
        <label className="flex items-center justify-between border border-stone-200 p-3 text-sm">Published <Switch checked={form.published} onCheckedChange={(published) => setForm({ ...form, published })} /></label>
      </div>
      <Button disabled={pending} onClick={() => void save()}>{pending ? "Saving..." : "Save package"}</Button>
    </div>
  );
}
