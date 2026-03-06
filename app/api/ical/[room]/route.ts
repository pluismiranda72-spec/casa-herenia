import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/** Anonymous slug → calendar display name. No property/domain data. */
const SLUG_TO_CALNAME: Record<string, string> = {
  "room-1": "Sync_Node_01",
  "room-2": "Sync_Node_02",
  "full-villa": "Sync_Node_03",
};

const SLUG_TO_IDS: Record<string, string[]> = {
  "room-1": ["room_1", "full_villa"],
  "room-2": ["room_2", "full_villa"],
  "full-villa": ["room_1", "room_2", "full_villa"],
};

function parseDateUTC(ymd: string): Date {
  return new Date(ymd + "T12:00:00.000Z");
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
  const calName = normalized && SLUG_TO_CALNAME[normalized];

  if (!roomIds || !calName) {
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
    name: calName,
    description: "Automated availability feed",
    prodId: "-//Standard_Node//EN",
    timezone: "UTC",
    method: "PUBLISH",
    x: [
      ["X-WR-CALNAME", calName],
      ["X-WR-CALDESC", "Automated availability feed"],
    ],
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
      start: parseDateUTC(checkIn),
      end: parseDateUTC(checkOut),
      summary: "Blocked",
      id: randomUUID(),
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
      start: parseDateUTC(start),
      end: parseDateUTC(endExclusive),
      summary: "Blocked",
      id: randomUUID(),
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
