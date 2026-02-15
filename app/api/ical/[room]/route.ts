import { NextRequest, NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const SLUG_TO_IDS: Record<string, string[]> = {
  "room-1": ["room_1", "full_villa"],
  "room-2": ["room_2", "full_villa"],
  "full-villa": ["room_1", "room_2", "full_villa"],
};

function parseDate(ymd: string): Date {
  const d = new Date(ymd + "T12:00:00.000Z");
  return d;
}

function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ room: string }> }
) {
  const { room: roomSlug } = await context.params;
  const normalized = roomSlug?.toLowerCase().trim();
  const roomIds = normalized && SLUG_TO_IDS[normalized];
  if (!roomIds) {
    return NextResponse.json(
      { error: "Invalid room. Use room-1, room-2 or full-villa." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Calendar unavailable." },
      { status: 503 }
    );
  }

  const calendar = ical({
    name: "Availability Calendar",
    prodId: "//Rental//Availability//EN",
    method: ICalCalendarMethod.PUBLISH,
  });

  const { data: bookings } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("status", "confirmed")
    .in("room_id", roomIds);

  for (const b of bookings ?? []) {
    const checkIn = String(b.check_in);
    const checkOut = String(b.check_out);
    calendar.createEvent({
      start: parseDate(checkIn),
      end: parseDate(checkOut),
      summary: "RESERVED",
      allDay: true,
    });
  }

  const { data: blocks } = await supabase
    .from("manual_blocks")
    .select("start_date, end_date")
    .in("room_id", roomIds);

  for (const bl of blocks ?? []) {
    const start = String(bl.start_date);
    const endInclusive = String(bl.end_date);
    const endExclusive = addDays(endInclusive, 1);
    calendar.createEvent({
      start: parseDate(start),
      end: parseDate(endExclusive),
      summary: "CLOSED",
      allDay: true,
    });
  }

  const body = calendar.toString();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="calendar.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
