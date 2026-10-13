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
import { ImageUploader, StringListEditor } from "@/components/shared/editors";
import { EVENT_TYPES, type EventPackage } from "@/lib/types";
import { formatPeso, packagePrice, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function PackageAdminList() {
  const packages = useDemoStore((state) => state.packages);
  const updatePackage = useDemoStore((state) => state.updatePackage);
  const deletePackage = useDemoStore((state) => state.deletePackage);
  const duplicatePackage = useDemoStore((state) => state.duplicatePackage);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const offers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return packages.filter((item) => !needle || `${item.name} ${item.eventType}`.toLowerCase().includes(needle));
  }, [packages, query]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Offers"
        title="Packages"
        description="The compositions guests can buy. Sale prices replace the listed price on the site."
        actions={<Button asChild className="bg-neutral-950 text-white hover:bg-neutral-800"><Link href="/admin/packages/new">Add package</Link></Button>}
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a package or an occasion"
        aria-label="Search packages"
        className="h-11 max-w-md border-black/10 bg-white shadow-none"
      />
      {offers.length === 0 ? (
        <p className="rounded-lg border border-black/5 bg-white px-5 py-10 text-sm text-neutral-500">No packages match that search.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((item) => {
            const price = packagePrice(item.price, item.salePrice);
            const onSale = item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price;
            return (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
                <Link href={`/packages/${item.slug}`} className="relative block">
                  <img src={item.image} alt="" className="aspect-[3/2] w-full object-cover" />
                  <span className="absolute top-3 left-3 rounded-md bg-[#111111] px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-white uppercase">{item.eventType}</span>
                  {item.archived ? (
                    <span className="absolute top-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-neutral-500 uppercase">Archived</span>
                  ) : !item.published ? (
                    <span className="absolute top-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-neutral-500 uppercase">Hidden</span>
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold tracking-tight text-neutral-950">{item.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">{item.description}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <p className="text-xl font-bold text-neutral-950 tabular-nums">{formatPeso(price)}</p>
                    {onSale ? <p className="text-sm text-neutral-400 line-through tabular-nums">{formatPeso(item.price)}</p> : null}
                    <p className="text-sm text-neutral-400">· {item.guestCapacity} guests</p>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-neutral-600">
                    {item.inclusions.slice(0, 3).map((inclusion) => (
                      <li key={inclusion} className="flex gap-2"><span className="text-neutral-300">—</span><span>{inclusion}</span></li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-neutral-400">{item.inclusions.length} inclusions · {item.exclusions.length} left out</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                    <Button size="sm" variant="outline" asChild><Link href={`/packages/${item.slug}`}>View</Link></Button>
                    <Button size="sm" variant="outline" asChild><Link href={`/admin/packages/${item.id}/edit`}>Edit</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => { const copy = duplicatePackage(item.id); if (copy) { toast.success("Package duplicated."); router.push(`/admin/packages/${copy.id}/edit`); } }}>Duplicate</Button>
                    <Button size="sm" variant="outline" onClick={() => { updatePackage(item.id, { archived: !item.archived, published: item.archived ? item.published : false }); toast.success(item.archived ? "Package restored." : "Package archived."); }}>{item.archived ? "Restore" : "Archive"}</Button>
                    <Button size="sm" variant="outline" onClick={() => { updatePackage(item.id, { published: !item.published, archived: false }); toast.success(item.published ? "Package unpublished." : "Package published."); }}>{item.published ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => setRemoveId(item.id)}>Delete</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
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
