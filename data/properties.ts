export interface Property {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePerNight: number;
  /** Display symbol; platform is EUR-only. See lib/constants/currency. */
  currency: string;
  image: string;
  /** URLs para la galería de detalles del modal (10 imágenes). */
  galleryImages: string[];
  unit: "room_1" | "room_2" | "full_villa";
  /** Máximo de huéspedes. Junior Suites: 3; Villa completa: 6. */
  maxGuests: number;
  /** Huéspedes incluidos en el precio base. Por encima de este número se aplica extraPersonFee. Junior: 1, Villa: 4. */
  baseGuestsIncluded: number;
  /** Suplemento por noche por cada huésped por encima de baseGuestsIncluded (€/persona). */
  extraPersonFee?: number;
}

import { CURRENCY_SYMBOL } from "@/lib/constants/currency";

export const PROPERTIES: Property[] = [
  {
    id: "room-1",
    slug: "junior-suite-i",
    name: "JUNIOR SUITE I",
    description:
      "Ambiente exclusivo y acogedor. Atención bilingüe, Baño en suite, A/C, 2 camas dobles y minibar con agua de cortesía.",
    pricePerNight: 55,
    currency: CURRENCY_SYMBOL,
    image: "/room-1.jpg",
    galleryImages: [
      "/room-1.jpg",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "/room-1.jpg",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
      "/room-1.jpg",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    ],
    unit: "room_1",
    maxGuests: 3,
    baseGuestsIncluded: 1,
    extraPersonFee: 10,
  },
  {
    id: "room-2",
    slug: "junior-suite-ii",
    name: "JUNIOR SUITE II",
    description:
      "Ambiente exclusivo y acogedor. Atención bilingüe, Baño en suite, A/C, 2 camas dobles y minibar con agua de cortesía.",
    pricePerNight: 55,
    currency: CURRENCY_SYMBOL,
    image: "/room-2.jpg",
    galleryImages: [
      "/room-2.jpg",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80",
      "/room-2.jpg",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80",
      "/room-2.jpg",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    ],
    unit: "room_2",
    maxGuests: 3,
    baseGuestsIncluded: 1,
    extraPersonFee: 10,
  },
  {
    id: "full-villa",
    slug: "villa-herenia-exclusiva",
    name: "TWO-BEDROOM SUITE",
    description:
      "Privacidad total. Ambiente íntimo, tranquilo y exclusivo, con check-in flexible y guía local.",
    pricePerNight: 120,
    currency: CURRENCY_SYMBOL,
    image: "/doble-estancia.png",
    galleryImages: [
      "/doble-estancia.png",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "/doble-estancia.png",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
      "/doble-estancia.png",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    ],
    unit: "full_villa",
    maxGuests: 6,
    baseGuestsIncluded: 4,
    extraPersonFee: 15,
  },
];
