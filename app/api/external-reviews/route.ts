import { NextResponse } from "next/server";
import type { NormalizedReview, TripAdvisorRawReview } from "@/types/reviews";

const MIN_RATING_LUXURY = 4;

/**
 * Obtiene datos crudos de TripAdvisor.
 * Caché de 1 hora (revalidate). En fallo, devuelve [] para no romper la página.
 */
async function getTripAdvisorData(): Promise<TripAdvisorRawReview[]> {
  const url = process.env.TRIPADVISOR_API_URL;
  if (!url) {
    return [];
  }
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: process.env.TRIPADVISOR_API_KEY
        ? { Authorization: `Bearer ${process.env.TRIPADVISOR_API_KEY}` }
        : undefined,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.reviews ?? data?.data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function normalizeTripAdvisorReview(raw: TripAdvisorRawReview, index: number): NormalizedReview {
  return {
    id: raw.id ?? `ta-${index}`,
    quote: raw.text ?? raw.title ?? "",
    author: raw.user?.name ?? "Viajero",
    rating: typeof raw.rating === "number" ? raw.rating : 5,
    source: "tripadvisor",
  };
}

/**
 * API Route intermedia: NUNCA conectar el frontend directamente a TripAdvisor.
 * Filtra reseñas >= 4, normaliza a NormalizedReview, sirve con caché 1h.
 */
export async function GET() {
  try {
    const rawReviews = await getTripAdvisorData();
    const validReviews = rawReviews.filter((r) => r.rating >= MIN_RATING_LUXURY);
    const normalized: NormalizedReview[] = validReviews.map((r, i) =>
      normalizeTripAdvisorReview(r, i)
    );
    return NextResponse.json(normalized, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }
}
