import { NextResponse } from "next/server";

/**
 * GET /api/tours/amanecer/availability
 * Fechas bloqueadas solo para el tour "Amanecer en Los Acuáticos".
 * Independiente de GET /api/availability (habitaciones / iCal).
 * Ampliar aquí (Supabase, otra tabla, etc.) sin tocar reservas de habitaciones.
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
