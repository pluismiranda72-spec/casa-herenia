import { NextResponse } from "next/server";

/** Formato limpio que consume el frontend */
export interface ExternalReview {
  id: string | number;
  author: string;
  rating: number;
  text: string;
  source: string;
  date: string;
}

/** Ítem crudo de la API Hotels4 (API Dojo) */
interface Hotels4ReviewItem {
  id?: string | number;
  rating?: number;
  text?: string;
  publishedDate?: string;
  user?: { username?: string };
  author?: string;
  [key: string]: unknown;
}

const API_URL = "https://hotels4.p.rapidapi.com/reviews/list";
const DEFAULT_HOST = "hotels4.p.rapidapi.com";

function formatDate(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 7) return "Hace menos de una semana";
    if (diffDays < 30) return "Hace 2 semanas";
    if (diffDays < 60) return "Hace 1 mes";
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  } catch {
    return raw ?? "";
  }
}

/** Mapeo seguro con optional chaining */
function mapItem(item: Hotels4ReviewItem, index: number): ExternalReview {
  const rating = typeof item?.rating === "number" ? item.rating : 5;
  const text = item?.text ?? "";
  const author = item?.user?.username ?? item?.author ?? "Viajero";
  return {
    id: item?.id ?? `review-${index}`,
    author,
    rating,
    text,
    source: "TripAdvisor",
    date: formatDate(item?.publishedDate),
  };
}

/**
 * Endpoint: reseñas desde Hotels4 (API Dojo).
 * Sin datos falsos: si falla devuelve { error, message, details } o [].
 */
export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const hotelId = process.env.TRIPADVISOR_HOTEL_ID;
  const apiHost = process.env.RAPIDAPI_HOST ?? DEFAULT_HOST;

  if (!apiKey || !hotelId) {
    console.log("[external-reviews] Faltan env: RAPIDAPI_KEY o TRIPADVISOR_HOTEL_ID");
    return NextResponse.json(
      {
        error: true,
        message: "Faltan RAPIDAPI_KEY o TRIPADVISOR_HOTEL_ID",
        details: { hasKey: !!apiKey, hasHotelId: !!hotelId },
      },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    id: hotelId,
    limit: "5",
    sort: "newest",
    lang: "es_ES",
  });
  const url = `${API_URL}?${params.toString()}`;

  // —— Chivato: antes del fetch ——
  console.log("[external-reviews] Petición → ID:", hotelId, "| URL:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
      },
      next: { revalidate: 3600 },
    });

    // —— Chivato: status (403 = clave mal, 404 = ID mal, etc.) ——
    console.log("[external-reviews] Respuesta API → status:", res.status, res.statusText);

    if (!res.ok) {
      let bodyPreview = "";
      try {
        const text = await res.text();
        bodyPreview = text.slice(0, 300);
      } catch {
        bodyPreview = "(no se pudo leer body)";
      }
      console.log("[external-reviews] Body (preview):", bodyPreview);
      return NextResponse.json(
        {
          error: true,
          message: `API: ${res.status} ${res.statusText}`,
          details: {
            status: res.status,
            statusText: res.statusText,
            bodyPreview,
            hint:
              res.status === 403
                ? "Clave RapidAPI incorrecta o no suscrito al plan"
                : res.status === 404
                  ? "ID de hotel no encontrado (revisa TRIPADVISOR_HOTEL_ID)"
                  : undefined,
          },
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    // —— Chivato: datos crudos para ver estructura ——
    const rawPreview = JSON.stringify(data).slice(0, 500);
    console.log("[external-reviews] JSON recibido (preview):", rawPreview);

    const reviews: unknown[] =
      data?.data?.data ?? data?.data ?? data?.reviews ?? [];

    if (!Array.isArray(reviews)) {
      console.log("[external-reviews] La API no devolvió un array. Keys:", Object.keys(data ?? {}));
      return NextResponse.json(
        {
          error: true,
          message: "La API no devolvió un array de reseñas",
          details: { rootKeys: Object.keys(data ?? {}) },
        },
        { status: 502 }
      );
    }

    const mapped = reviews
      .filter((item): item is Hotels4ReviewItem => item != null && typeof item === "object")
      .map((item, index) => mapItem(item, index));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const details =
      err instanceof Error
        ? { name: err.name, stack: err.stack?.slice(0, 400) }
        : { raw: String(err) };
    console.error("[external-reviews] Error:", message, details);
    return NextResponse.json(
      {
        error: true,
        message,
        details,
      },
      { status: 500 }
    );
  }
}
