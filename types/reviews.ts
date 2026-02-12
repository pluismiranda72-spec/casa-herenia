/**
 * Estructura unificada para reseñas (internas y TripAdvisor).
 * Permite reutilizar el mismo componente de tarjeta en toda la web.
 */
export interface NormalizedReview {
  id: string;
  quote: string;
  author: string;
  rating: number;
  source?: "internal" | "tripadvisor";
}

/**
 * Forma típica de un ítem en la respuesta de TripAdvisor (API o scraping).
 * Ajustar campos según la API real.
 */
export interface TripAdvisorRawReview {
  id?: string;
  rating: number;
  text?: string;
  title?: string;
  user?: { name?: string };
  published_date?: string;
}
