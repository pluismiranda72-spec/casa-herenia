import { NextResponse } from "next/server";

/**
 * GET /api/tours/caballo/availability
 * Fechas bloqueadas solo para el tour "Ruta a Caballo en Viñales".
 * Independiente de amanecer y de GET /api/availability (habitaciones).
 */
export async function GET() {
  const blocked: string[] = [];
  return NextResponse.json(
    { blocked },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
