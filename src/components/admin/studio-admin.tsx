"use client";

import { useState } from "react";
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
import { DataTable } from "@/components/shared/data-table";
import { ImageUploader } from "@/components/shared/editors";
import { Lightbox } from "@/components/shared/lightbox";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Testimonial } from "@/lib/types";
import { formatDateTime, wait } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

const categories = ["Weddings", "Birthdays", "Debuts", "Corporate", "Conferences", "Celebrations", "Styling"];

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

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Website" title="Website settings" description="These details appear in the public footer and contact page." />
      <form className="grid gap-4 border border-stone-200 bg-white p-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Company name"><Input className={adminControlClass} {...form.register("companyName")} /></Field>
        <Field label="Email"><Input className={adminControlClass} {...form.register("email")} /></Field>
        <div className="md:col-span-2"><Field label="Company description"><Textarea {...form.register("companyDescription")} /></Field></div>
        <Field label="Phone"><Input className={adminControlClass} {...form.register("phone")} /></Field>
        <Field label="Business hours"><Input className={adminControlClass} {...form.register("businessHours")} /></Field>
        <div className="md:col-span-2"><Field label="Address"><Input className={adminControlClass} {...form.register("address")} /></Field></div>
        <Field label="Facebook"><Input className={adminControlClass} {...form.register("facebook")} /></Field>
        <Field label="Instagram"><Input className={adminControlClass} {...form.register("instagram")} /></Field>
        <Field label="TikTok"><Input className={adminControlClass} {...form.register("tiktok")} /></Field>
        <Field label="YouTube"><Input className={adminControlClass} {...form.register("youtube")} /></Field>
        <div className="md:col-span-2"><Field label="Website"><Input className={adminControlClass} {...form.register("website")} /></Field></div>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Settings"}</Button>
      </form>
      <div className="border border-destructive/30 bg-white p-5">
        <h2 className="font-medium">Reset Demo Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Restore the original sample venues, inquiries, proposals, and website copy.</p>
        <Button className="mt-4" variant="destructive" onClick={() => setConfirm(true)}>Reset Demo Data</Button>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Reset demo data?"
        description="This replaces everything saved in this browser with the original sample."
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          resetDemo();
          form.reset(useDemoStore.getState().settings);
          toast.success("Demo data restored.");
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
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Users" />
      <div className="grid gap-3 border border-stone-200 bg-white p-4 md:grid-cols-4">
        <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input placeholder="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
        <Button onClick={() => {
          if (form.name.trim().length < 2 || !form.email.includes("@")) {
            toast.error("Enter a name and email.");
            return;
          }
          inviteUser(form);
          toast.success("Invitation recorded (Demo Mode).");
          setForm({ name: "", email: "", role: "Coordinator" });
        }}>Invite user</Button>
      </div>
      <DataTable
        rows={users}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.name} ${row.email} ${row.role}`}
        searchPlaceholder="Search users"
        emptyTitle="No users found"
        emptyDescription="Invite a teammate to the demo workspace."
        columns={[
          { key: "name", header: "Name", sortValue: (row) => row.name, cell: (row) => row.name },
          { key: "email", header: "Email", cell: (row) => row.email },
          { key: "role", header: "Role", cell: (row) => row.role },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "actions", header: "Actions", cell: (row) => <Button size="sm" variant="outline" onClick={() => { const next = row.status === "Active" ? "Inactive" : "Active"; setUserStatus(row.id, next); toast.success(`User marked ${next}.`); }}>{row.status === "Active" ? "Deactivate" : "Activate"}</Button> },
        ]}
      />
    </div>
  );
}

export function ActivityAdmin() {
  const activity = useDemoStore((state) => state.activity);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Activity logs" />
      <DataTable
        rows={activity}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.action} ${row.actor}`}
        searchPlaceholder="Search activity"
        emptyTitle="No activity yet"
        emptyDescription="Studio actions will be listed here."
        columns={[
          { key: "when", header: "When", sortValue: (row) => row.createdAt, cell: (row) => formatDateTime(row.createdAt) },
          { key: "actor", header: "Actor", sortValue: (row) => row.actor, cell: (row) => row.actor },
          { key: "action", header: "Action", cell: (row) => row.action },
        ]}
      />
    </div>
  );
}
