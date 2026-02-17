/**
 * Servicio de obtención de reseñas de TripAdvisor vía RapidAPI.
 * Caché 24h para no gastar cuota innecesaria.
 */

const RAPIDAPI_HOST = "tripadvisor16.p.rapidapi.com";
const RAPIDAPI_REVIEWS_URL = `https://${RAPIDAPI_HOST}/api/v1/hotels/getHotelReviews`;

export interface RapidApiReviewItem {
  id?: string;
  rating?: number;
  text?: string;
  title?: string;
  user?: { name?: string };
  publishedDate?: string;
  createDate?: string;
  [key: string]: unknown;
}

export interface TripAdvisorReviewsResponse {
  data?: { reviews?: RapidApiReviewItem[] };
  reviews?: RapidApiReviewItem[];
  [key: string]: unknown;
}

/**
 * Obtiene las reseñas del hotel desde RapidAPI (TripAdvisor).
 * @param locationId - ID de la propiedad en TripAdvisor (ej. 15045948)
 * @returns Lista de ítems crudos o [] si falla
 */
export async function getTripAdvisorReviews(
  locationId: string
): Promise<RapidApiReviewItem[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  const url = new URL(RAPIDAPI_REVIEWS_URL);
  url.searchParams.set("id", locationId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    next: { revalidate: 86400 }, // 24 horas
  });

  if (!res.ok) return [];

  const data: TripAdvisorReviewsResponse = await res.json();
  const list =
    data?.data?.reviews ?? data?.reviews ?? (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}
