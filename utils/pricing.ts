import type { Property } from "@/data/properties";

export interface NightlyPricing {
  /** Precio base por noche (el de la propiedad). */
  basePrice: number;
  /** Número de huéspedes por encima del incluido en la base. */
  extraGuests: number;
  /** Suplemento por noche (extraGuests × extraPersonFee). */
  nightlyExtraFee: number;
  /** Precio total por noche: base + suplemento. */
  totalNightlyPrice: number;
}

/**
 * Calcula el precio por noche según la unidad:
 * - Junior Suites: base cubre 2 personas; 3.ª persona +15€/noche.
 * - Villa Completa: base cubre 4 personas; 5.ª y 6.ª +15€/persona/noche.
 */
export function getNightlyPricing(
  property: Property,
  selectedGuests: number
): NightlyPricing {
  const basePrice = property.pricePerNight;
  const included = property.baseGuestsIncluded ?? 2;
  const feePerExtra = property.extraPersonFee ?? 0;

  const extraGuests = Math.max(0, selectedGuests - included);
  const nightlyExtraFee = extraGuests * feePerExtra;
  const totalNightlyPrice = basePrice + nightlyExtraFee;

  return {
    basePrice,
    extraGuests,
    nightlyExtraFee,
    totalNightlyPrice,
  };
}
