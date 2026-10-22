"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminControlClass, Field, PageHeader } from "@/components/shared/chrome";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ImageUploader } from "@/components/shared/editors";
import { Lightbox } from "@/components/shared/lightbox";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Testimonial } from "@/lib/types";
import { formatDate, formatDateTime, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

const categories = ["Corporate", "Team building", "Ballrooms", "Celebrations", "Setups"];

export function GalleryAdmin() {
  const gallery = useDemoStore((state) => state.gallery);
  const addGalleryItem = useDemoStore((state) => state.addGalleryItem);
  const updateGalleryItem = useDemoStore((state) => state.updateGalleryItem);
  const deleteGalleryItem = useDemoStore((state) => state.deleteGalleryItem);
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [preview, setPreview] = useState<number | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Gallery" description="Photographs shown on the public gallery and homepage." />
      <div className="grid gap-3 border border-stone-200 bg-white p-4 md:grid-cols-2">
        <Field label="Caption"><Input className={adminControlClass} value={caption} onChange={(event) => setCaption(event.target.value)} /></Field>
        <Field label="Category">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Image"><ImageUploader multiple={false} images={images} onChange={setImages} /></Field>
        </div>
        <Button
          onClick={() => {
            if (!images[0] || !caption.trim()) {
              toast.error("Add an image and a caption.");
              return;
            }
            addGalleryItem({ src: images[0], caption, category, featured: false });
            setImages([]);
            setCaption("");
            toast.success("Image added to the gallery.");
          }}
        >
          Add Image
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.length === 0 ? <p className="text-sm text-muted-foreground">No images yet.</p> : gallery.map((item, index) => (
          <article key={item.id} className="border border-stone-200 bg-white p-3">
            <button type="button" onClick={() => setPreview(index)} className="block w-full">
              <img src={item.src} alt={item.caption} className="aspect-[3/2] w-full object-cover" />
            </button>
            <Input className="mt-3" value={item.caption} onChange={(event) => updateGalleryItem(item.id, { caption: event.target.value })} />
            <Select value={item.category} onValueChange={(value) => { updateGalleryItem(item.id, { category: value }); toast.success("Category updated."); }}>
              <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setPreview(index)}>Preview Image</Button>
              <Button size="sm" variant="outline" onClick={() => { updateGalleryItem(item.id, { featured: !item.featured }); toast.success(item.featured ? "Removed from featured." : "Marked as featured."); }}>{item.featured ? "Unfeature" : "Mark Featured"}</Button>
              <Button size="sm" variant="destructive" onClick={() => setRemoveId(item.id)}>Remove Image</Button>
            </div>
          </article>
        ))}
      </div>
      <Lightbox images={gallery.map((item) => ({ src: item.src, caption: item.caption }))} index={preview} onClose={() => setPreview(null)} onIndex={setPreview} />
      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Remove image?"
        description="This photograph will disappear from the public gallery."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (!removeId) return;
          deleteGalleryItem(removeId);
          toast.success("Image removed.");
          setRemoveId(null);
        }}
      />
    </div>
  );
}

const blankQuote: Omit<Testimonial, "id"> = {
  name: "",
  role: "",
  eventType: "Wedding",
  quote: "",
  rating: 5,
  image: "",
  featured: false,
  published: true,
};

export function TestimonialAdmin() {
  const testimonials = useDemoStore((state) => state.testimonials);
  const addTestimonial = useDemoStore((state) => state.addTestimonial);
  const updateTestimonial = useDemoStore((state) => state.updateTestimonial);
  const deleteTestimonial = useDemoStore((state) => state.deleteTestimonial);
  const [form, setForm] = useState(blankQuote);
  const [editing, setEditing] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  function save() {
    if (form.name.trim().length < 2 || form.quote.trim().length < 8) {
      toast.error("Add a name and a quote.");
      return;
    }
    if (editing) {
      updateTestimonial(editing, form);
      toast.success("Testimonial updated.");
    } else {
      addTestimonial(form);
      toast.success("Testimonial added.");
    }
    setForm(blankQuote);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Testimonials" description="Published quotes appear on the homepage." />
      <div className="grid gap-3 border border-stone-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
        </div>
        <Textarea placeholder="Quote" value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} />
        <ImageUploader multiple={false} images={form.image ? [form.image] : []} onChange={(images) => setForm({ ...form, image: images[0] ?? "" })} />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">Published <Switch checked={form.published} onCheckedChange={(published) => setForm({ ...form, published })} /></label>
          <label className="flex items-center gap-2">Featured <Switch checked={form.featured} onCheckedChange={(featured) => setForm({ ...form, featured })} /></label>
        </div>
        <Button onClick={save}>{editing ? "Save testimonial" : "Add testimonial"}</Button>
      </div>
      <div className="space-y-3">
        {testimonials.map((item) => (
          <article key={item.id} className="flex flex-col gap-3 border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="mt-2 max-w-2xl font-display text-2xl leading-snug text-ink">“{item.quote}”</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={item.published ? "Published" : "Unpublished"} />
                {item.featured ? <StatusBadge status="Featured" /> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(item.id); setForm(item); }}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => { updateTestimonial(item.id, { published: !item.published }); toast.success(item.published ? "Testimonial unpublished." : "Testimonial published."); }}>{item.published ? "Unpublish" : "Publish"}</Button>
              <Button size="sm" variant="outline" onClick={() => { updateTestimonial(item.id, { featured: !item.featured }); toast.success(item.featured ? "Removed from featured." : "Testimonial featured."); }}>{item.featured ? "Unfeature" : "Feature"}</Button>
              <Button size="sm" variant="destructive" onClick={() => setRemoveId(item.id)}>Delete</Button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Delete testimonial?"
        description="This quote will be removed from the demo."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!removeId) return;
          deleteTestimonial(removeId);
          toast.success("Testimonial deleted.");
          setRemoveId(null);
        }}
      />
    </div>
  );
}

const settingsSchema = z.object({
  companyName: z.string().min(2),
  companyDescription: z.string().min(10),
  email: z.email(),
  phone: z.string(),
  address: z.string().min(5),
  facebook: z.string(),
  instagram: z.string(),
  tiktok: z.string(),
  youtube: z.string(),
  website: z.string(),
  businessHours: z.string().min(3),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function SettingsAdmin() {
  const settings = useDemoStore((state) => state.settings);
  const updateSettings = useDemoStore((state) => state.updateSettings);
  const resetDemo = useDemoStore((state) => state.resetDemo);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const form = useForm<SettingsValues>({ resolver: zodResolver(settingsSchema), defaultValues: settings });

  async function onSubmit(values: SettingsValues) {
    setPending(true);
    await wait();
    updateSettings(values);
    setPending(false);
    toast.success("Settings saved.");
  }

  const preview = form.watch();
  const control = `${adminControlClass} rounded-md border-black/10 shadow-none`;
  const socials = [
    ["Facebook", preview.facebook],
    ["Instagram", preview.instagram],
    ["TikTok", preview.tiktok],
    ["YouTube", preview.youtube],
  ].filter(([, value]) => value.trim());

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Website" title="Website settings" description="What you save here is what the public footer and contact page show." />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <section className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-950">The house</h2>
            <p className="mt-1 text-xs text-neutral-400">The name and the sentence visitors read first.</p>
            <div className="mt-4 grid gap-4">
              <Field label="Company name" error={form.formState.errors.companyName?.message}>
                <Input className={control} {...form.register("companyName")} />
              </Field>
              <Field label="Company description" error={form.formState.errors.companyDescription?.message}>
                <Textarea className="rounded-md border-black/10 shadow-none" {...form.register("companyDescription")} />
              </Field>
            </div>
          </section>
          <section className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-950">How to reach the desk</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Email" error={form.formState.errors.email?.message}><Input className={control} {...form.register("email")} /></Field>
              <Field label="Phone"><Input className={control} {...form.register("phone")} /></Field>
              <Field label="Business hours" error={form.formState.errors.businessHours?.message}><Input className={control} {...form.register("businessHours")} /></Field>
              <div className="md:col-span-2"><Field label="Address" error={form.formState.errors.address?.message}><Input className={control} {...form.register("address")} /></Field></div>
            </div>
          </section>
          <section className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-950">On the web</h2>
            <p className="mt-1 text-xs text-neutral-400">Leave a field empty and it stays off the footer.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Facebook"><Input className={control} {...form.register("facebook")} /></Field>
              <Field label="Instagram"><Input className={control} {...form.register("instagram")} /></Field>
              <Field label="TikTok"><Input className={control} {...form.register("tiktok")} /></Field>
              <Field label="YouTube"><Input className={control} {...form.register("youtube")} /></Field>
              <div className="md:col-span-2"><Field label="Website"><Input className={control} {...form.register("website")} /></Field></div>
            </div>
            <Button type="submit" disabled={pending} className="mt-5 bg-neutral-950 text-white hover:bg-neutral-800">{pending ? "Saving..." : "Save settings"}</Button>
          </section>
        </form>
        <div className="grid gap-4">
          <aside className="rounded-lg bg-[#111111] p-6 text-white">
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/40 uppercase">Public footer</p>
            <p className="mt-4 text-2xl font-bold tracking-tight">{preview.companyName || "RSVPNow"}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{preview.companyDescription}</p>
            <div className="mt-6 space-y-1 text-sm text-white/80">
              {preview.address ? <p>{preview.address}</p> : null}
              {preview.businessHours ? <p>{preview.businessHours}</p> : null}
              {preview.email ? <p>{preview.email}</p> : null}
              {preview.phone ? <p>{preview.phone}</p> : null}
              {preview.website ? <p>{preview.website}</p> : null}
            </div>
            {socials.length > 0 ? (
              <p className="mt-4 text-xs tracking-wide text-white/50 uppercase">{socials.map(([label]) => label).join(" · ")}</p>
            ) : null}
          </aside>
          <section className="rounded-lg border border-red-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-950">Clear workspace data</h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              Remove venues, packages, inquiries, bookings, and other records saved in this browser. Company settings stay.
            </p>
            <Button className="mt-4" variant="destructive" onClick={() => setConfirm(true)}>
              Clear all data
            </Button>
          </section>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Clear all workspace data?"
        description="This deletes sample and saved records in this browser. Company settings are kept. You can add real data again afterward."
        confirmLabel="Clear"
        destructive
        onConfirm={() => {
          resetDemo();
          form.reset(useDemoStore.getState().settings);
          toast.success("Workspace data cleared.");
          setConfirm(false);
        }}
      />
    </div>
  );
}

export function UsersAdmin() {
  const users = useDemoStore((state) => state.users);
  const inviteUser = useDemoStore((state) => state.inviteUser);
  const setUserStatus = useDemoStore((state) => state.setUserStatus);
  const [form, setForm] = useState({ name: "", email: "", role: "Coordinator" });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Desk" title="Users" description="The people who can sign in. Invites stay in this browser. No email is sent." />
      <div className="grid items-start gap-5 lg:grid-cols-[18rem_1fr]">
        <form
          className="rounded-lg border border-black/5 bg-white p-5 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            if (form.name.trim().length < 2 || !form.email.includes("@")) {
              toast.error("Enter a name and email.");
              return;
            }
            inviteUser(form);
            toast.success("Invitation recorded.");
            setForm({ name: "", email: "", role: "Coordinator" });
          }}
        >
          <h2 className="text-sm font-semibold text-neutral-950">Invite someone</h2>
          <p className="mt-1 text-xs text-neutral-400">They appear on the desk as invited until you activate them.</p>
          <div className="mt-4 space-y-3">
            <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 rounded-md border-black/10 shadow-none" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-10 rounded-md border-black/10 shadow-none" /></Field>
            <Field label="Role"><Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="h-10 rounded-md border-black/10 shadow-none" /></Field>
          </div>
          <Button type="submit" className="mt-4 w-full bg-neutral-950 text-white hover:bg-neutral-800">Invite</Button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <article key={user.id} className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${user.status === "Active" ? "bg-[#c4454d]" : "bg-neutral-300"}`}>
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-950">{user.name}</p>
                  <p className="text-sm text-neutral-500">{user.role}</p>
                </div>
              </div>
              <p className="mt-4 truncate text-sm text-neutral-500">{user.email}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <StatusBadge status={user.status} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const next = user.status === "Active" ? "Inactive" : "Active";
                    setUserStatus(user.id, next);
                    toast.success(`${user.name} marked ${next.toLowerCase()}.`);
                  }}
                >
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const entityHref: Record<string, (id: string) => string> = {
  inquiry: (id) => `/admin/inquiries/${id}`,
  proposal: (id) => `/admin/proposals/${id}`,
  booking: (id) => `/admin/bookings/${id}`,
  gallery: () => "/admin/gallery",
  client: (id) => `/admin/clients/${id}`,
};

export function ActivityAdmin() {
  const activity = useDemoStore((state) => state.activity);
  const [query, setQuery] = useState("");
  const days = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = [...activity]
      .filter((entry) => !needle || `${entry.action} ${entry.actor} ${entry.entityType ?? ""}`.toLowerCase().includes(needle))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups = new Map<string, typeof visible>();
    for (const entry of visible) {
      const day = entry.createdAt.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), entry]);
    }
    return [...groups.entries()];
  }, [activity, query]);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Desk" title="Activity" description="What the team and the website changed, newest first." />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a person or an action"
        aria-label="Search activity"
        className="h-11 max-w-md rounded-md border-black/10 bg-white shadow-none"
      />
      {days.length === 0 ? (
        <p className="rounded-lg border border-black/5 bg-white px-5 py-10 text-sm text-neutral-500">Nothing in the log matches that search.</p>
      ) : (
        <div className="space-y-8">
          {days.map(([day, entries]) => (
            <section key={day}>
              <h2 className="text-sm font-semibold text-neutral-950">{formatDate(day)}</h2>
              <ol className="mt-4 border-l border-neutral-200">
                {entries.map((entry) => {
                  const href = entry.entityType && entry.entityId ? entityHref[entry.entityType]?.(entry.entityId) : undefined;
                  return (
                    <li key={entry.id} className="relative pb-6 pl-6 last:pb-0">
                      <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-[#c4454d]" />
                      <p className="text-sm font-medium text-neutral-950">{entry.action}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {entry.actor} · {formatDateTime(entry.createdAt).split(" · ")[1] ?? formatDateTime(entry.createdAt)}
                        {entry.entityType ? ` · ${entry.entityType}` : ""}
                        {href ? (
                          <>
                            {" · "}
                            <Link href={href} className="font-medium text-neutral-950 underline-offset-4 hover:underline">Open</Link>
                          </>
                        ) : null}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
