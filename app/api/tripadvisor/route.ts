import { NextResponse } from "next/server";

/**
 * API Route: Proxy TripAdvisor.
 * Filtrar reseñas < 4 estrellas, cachear resultados.
 */
export async function GET() {
  // TODO: Proxy + filter + cache
  return NextResponse.json({ message: "TripAdvisor proxy placeholder" });
}
