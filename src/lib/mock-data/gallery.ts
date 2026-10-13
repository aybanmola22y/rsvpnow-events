import type { GalleryItem } from "@/lib/types";
import { photos } from "@/lib/images";

export const seedGallery: GalleryItem[] = [
  { id: "gal-1", src: photos.reception, caption: "Candlelit reception at the Grand Ballroom", category: "Weddings", featured: true },
  { id: "gal-2", src: photos.vows, caption: "Garden ceremony above Tagaytay", category: "Weddings", featured: true },
  { id: "gal-3", src: photos.couple, caption: "Portraits before the first dance", category: "Weddings", featured: true },
  { id: "gal-4", src: photos.balloons, caption: "A family birthday in the pavilion", category: "Birthdays", featured: true },
  { id: "gal-5", src: photos.celebration, caption: "Toast at a milestone dinner", category: "Birthdays", featured: false },
  { id: "gal-6", src: photos.dance, caption: "Cotillion floor for a debut", category: "Debuts", featured: true },
  { id: "gal-7", src: photos.floral, caption: "Stage florals in ivory and green", category: "Debuts", featured: false },
  { id: "gal-8", src: photos.workshop, caption: "Leadership session in BGC", category: "Corporate", featured: true },
  { id: "gal-9", src: photos.conference, caption: "Morning keynote at Skyline Hall", category: "Conferences", featured: true },
  { id: "gal-10", src: photos.stage, caption: "Launch stage before doors", category: "Conferences", featured: false },
  { id: "gal-11", src: photos.coast, caption: "Company dinner facing the water", category: "Celebrations", featured: true },
  { id: "gal-12", src: photos.cocktail, caption: "Welcome drinks on the deck", category: "Styling", featured: false },
];
