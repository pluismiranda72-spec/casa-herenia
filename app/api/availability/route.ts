import { NextResponse } from "next/server";
import { getBlockedDatesByUnit, blockedDatesToYmd } from "@/lib/ical";

/**
 * GET /api/availability
 * Devuelve las fechas bloqueadas por habitación (YYYY-MM-DD) desde iCal Airbnb.
 * Caché 1h vía getBlockedDatesByUnit (fetch con revalidate).
 */
export async function GET() {
  try {
    const blocked = await getBlockedDatesByUnit();
    const payload = blockedDatesToYmd(blocked);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json(
      { room_1: [], room_2: [], full_villa: [] },
      { status: 200 }
    );
  }
}
