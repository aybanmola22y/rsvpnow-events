"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readImageFile } from "@/lib/images";

export function ImageUploader({
  images,
  onChange,
  multiple = true,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [reading, setReading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setReading(true);
    try {
      const previews = await Promise.all(Array.from(files).map((file) => readImageFile(file)));
      onChange(multiple ? [...images, ...previews] : previews.slice(0, 1));
      toast.success("Image preview added.");
    } catch {
      toast.error("That image could not be read.");
    } finally {
      setReading(false);
    }
  }

  function addUrl() {
    const next = url.trim();
    if (!next) return;
    onChange(multiple ? [...images, next] : [next]);
    setUrl("");
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <div key={`${image.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-lg border bg-muted">
            <img src={image} alt="" className="h-28 w-full object-cover" />
            <button
              type="button"
              className="absolute top-2 right-2 rounded-full bg-white/90 p-1"
              onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={reading}
        onChange={(event) => {
          void onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Or paste an image URL"
          className="h-10 bg-white"
        />
        <Button type="button" variant="outline" onClick={addUrl}>
          Add URL
        </Button>
      </div>
      {reading ? <p className="text-xs text-muted-foreground">Preparing preview...</p> : null}
    </div>
  );
}

export function StringListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const next = draft.trim();
    if (!next) return;
    onChange([...values, next]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <button
            key={`${value}-${index}`}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
          >
            {value}
            <X className="size-3" />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10 bg-white"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}
