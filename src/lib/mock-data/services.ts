import type { Service } from "@/lib/types";
import { photos } from "@/lib/images";

export const seedServices: Service[] = [
  {
    id: "svc-coordination",
    name: "Event Coordination",
    slug: "event-coordination",
    description:
      "A lead planner and floor team who build the run of show, confirm suppliers, and stay on headset from ingress to the last song.",
    image: photos.workshop,
    price: 25000,
    pricingType: "Fixed",
    category: "Planning",
    active: true,
  },
  {
    id: "svc-catering",
    name: "Catering",
    slug: "catering",
    description:
      "Seasonal menus plated or served family-style, with dietary notes taken seriously and a captain who watches the room, not only the pass.",
    image: photos.buffet,
    price: 850,
    pricingType: "Per Person",
    category: "Culinary",
    active: true,
  },
  {
    id: "svc-styling",
    name: "Stage Styling",
    slug: "stage-styling",
    description:
      "Backdrop, florals, and furniture for the stage or head table so the program has a frame and the photographs have a place to land.",
    image: photos.floral,
    price: 18000,
    pricingType: "Fixed",
    category: "Design",
    active: true,
  },
  {
    id: "svc-lights",
    name: "Lights & Sounds",
    slug: "lights-and-sounds",
    description:
      "A house rig for speeches, dinner, and dancing, tuned so toasts are clear and the dance floor does not drown the tables.",
    image: photos.lights,
    price: 15000,
    pricingType: "Fixed",
    category: "Production",
    active: true,
  },
  {
    id: "svc-photo",
    name: "Photography",
    slug: "photography",
    description:
      "Two photographers for coverage of preparations, the program, and the portraits families actually frame.",
    image: photos.camera,
    price: 22000,
    pricingType: "Fixed",
    category: "Production",
    active: true,
  },
  {
    id: "svc-video",
    name: "Videography",
    slug: "videography",
    description:
      "A same-day highlight and a full film, shot with a lead and an assistant so the entrance and the parents’ speech are both covered.",
    image: photos.stage,
    price: 28000,
    pricingType: "Fixed",
    category: "Production",
    active: true,
  },
  {
    id: "svc-led",
    name: "LED Wall",
    slug: "led-wall",
    description:
      "A modular LED wall for names, films, and sponsor loops, with a technician who stays through the program.",
    image: photos.conference,
    price: 8000,
    pricingType: "Per Day",
    category: "Production",
    active: true,
  },
  {
    id: "svc-booth",
    name: "Photobooth",
    slug: "photobooth",
    description:
      "An open-air booth with an attendant, printed strips, and a digital gallery sent the next morning.",
    image: photos.celebration,
    price: 7500,
    pricingType: "Fixed",
    category: "Entertainment",
    active: true,
  },
  {
    id: "svc-emcee",
    name: "Host / Emcee",
    slug: "host-emcee",
    description:
      "A host who has read the brief, knows how to pronounce the names, and can recover a program that runs long.",
    image: photos.crowd,
    price: 8000,
    pricingType: "Per Hour",
    category: "Entertainment",
    active: true,
  },
  {
    id: "svc-rental",
    name: "Equipment Rental",
    slug: "equipment-rental",
    description:
      "Chairs, linen, cocktail tables, and registration furniture when the venue inventory is not quite enough.",
    image: photos.reception,
    price: 5000,
    pricingType: "Per Day",
    category: "Rentals",
    active: true,
  },
  {
    id: "svc-floral",
    name: "Floral Design",
    slug: "floral-design",
    description:
      "A focused floral scheme for the ceremony, cake, and a handful of tables, designed to match the room rather than hide it.",
    image: photos.garden,
    price: 15000,
    pricingType: "Fixed",
    category: "Design",
    active: true,
  },
  {
    id: "svc-bar",
    name: "Signature Bar Program",
    slug: "signature-bar-program",
    description:
      "A hosted bar menu built around the evening: a welcome drink, a signature cocktail, and service that closes when the program does.",
    image: photos.cocktail,
    price: 20000,
    pricingType: "Custom",
    category: "Culinary",
    active: true,
  },
];
