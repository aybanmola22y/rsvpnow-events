"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type LightboxImage = {
  src: string;
  caption: string;
};

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const image = index == null ? null : images[index];
  return (
    <Dialog open={index != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden border-0 bg-ink p-0 text-ivory sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{image?.caption || "Gallery image"}</DialogTitle>
          <DialogDescription>Photograph from a previous RSVPNow event.</DialogDescription>
        </DialogHeader>
        {image ? (
          <div>
            <img src={image.src} alt={image.caption} className="max-h-[75vh] w-full object-contain" />
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">{image.caption}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white hover:text-ink"
                  onClick={() => onIndex((index! - 1 + images.length) % images.length)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white hover:text-ink"
                  onClick={() => onIndex((index! + 1) % images.length)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
