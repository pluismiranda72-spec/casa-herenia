import { NextResponse } from "next/server";

/**
 * API Route: Sincronización bidireccional con iCal de Airbnb.
 * Caché 1 hora. Consumir AIRBNB_ICAL_ROOM1, ROOM2, FULL (o legacy URL_1, URL_2, URL_PACK).
 */
export async function GET() {
  // TODO: Fetch iCal URLs, parse, merge availability, cache 1h
  return NextResponse.json({ message: "iCal sync placeholder" });
}
