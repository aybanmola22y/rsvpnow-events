import type { GalleryItem } from "@/lib/types";
import { photos } from "@/lib/images";

export const seedGallery: GalleryItem[] = [
  { id: "gal-1", src: photos.conference, caption: "Morning conference in the hall", category: "Corporate", featured: true },
  { id: "gal-2", src: photos.setup, caption: "Tables dressed before doors", category: "Setups", featured: true },
  { id: "gal-3", src: photos.workshop, caption: "Team session around one table", category: "Team building", featured: true },
  { id: "gal-4", src: photos.meeting, caption: "Hall set before the briefing", category: "Corporate", featured: true },
  { id: "gal-5", src: photos.celebration, caption: "Dinner after the program", category: "Setups", featured: true },
  { id: "gal-6", src: photos.reception, caption: "Round tables dressed for the event", category: "Setups", featured: true },
  { id: "gal-7", src: photos.crowd, caption: "Workshop in the function room", category: "Team building", featured: false },
  { id: "gal-8", src: photos.stage, caption: "Keynote stage before the first speaker", category: "Corporate", featured: true },
  { id: "gal-9", src: photos.buffet, caption: "Catering set for service", category: "Setups", featured: false },
  { id: "gal-10", src: photos.dining, caption: "Plated dinner in the hotel", category: "Corporate", featured: true },
  { id: "gal-11", src: photos.cocktail, caption: "Welcome drinks before dinner", category: "Setups", featured: false },
  { id: "gal-12", src: photos.vows, caption: "Team briefing before the program", category: "Team building", featured: false },
];
