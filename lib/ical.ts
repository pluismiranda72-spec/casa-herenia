import ical from "node-ical";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type PropertyUnit = "room_1" | "room_2" | "full_villa";

/** Fechas bloqueadas por unidad: array de Date (12:00 local) para react-day-picker. */
export type BlockedDatesByUnit = Record<PropertyUnit, Date[]>;

/** Formato serializado para la API: YYYY-MM-DD por unidad. */
export type BlockedDatesByUnitYmd = Record<PropertyUnit, string[]>;

// En Vercel: usar AIRBNB_ICAL_ROOM1, AIRBNB_ICAL_ROOM2, AIRBNB_ICAL_FULL (o legacy URL_1, URL_2, URL_PACK)
const ENV_ROOM1 = "AIRBNB_ICAL_ROOM1";
const ENV_ROOM2 = "AIRBNB_ICAL_ROOM2";
const ENV_FULL = "AIRBNB_ICAL_FULL";

function getIcalUrl(key: string): string | undefined {
  const v = process.env[key];
  if (v) return v;
  const legacy: Record<string, string> = {
    [ENV_ROOM1]: "AIRBNB_ICAL_URL_1",
    [ENV_ROOM2]: "AIRBNB_ICAL_URL_2",
    [ENV_FULL]: "AIRBNB_ICAL_URL_PACK",
  };
  return process.env[legacy[key]];
}

/**
 * Normaliza una fecha del iCal para evitar desfases de zona horaria.
 * Convierte a string ISO, extrae solo YYYY-MM-DD, y crea un Date a las 12:00:00
 * (mediodía) local para que el cambio de horario no mueva la fecha al día anterior.
 */
function normalizeDate(date: Date): Date {
  const iso = date.toISOString();
  const datePart = iso.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Regla de hotel: bloquea desde start (check-in) hasta end - 1 día (check-out libre).
 * Ejemplo: reserva del 10 al 14 → bloquea 10, 11, 12, 13. El 14 queda libre.
 */
function eventToBlockedDates(start: Date, end: Date): Date[] {
  const startNorm = normalizeDate(start);
  const endNorm = normalizeDate(end);
  const blocked: Date[] = [];
  const cur = new Date(startNorm.getTime());

  while (cur.getTime() < endNorm.getTime()) {
    blocked.push(new Date(cur.getTime()));
    cur.setDate(cur.getDate() + 1);
  }

  return blocked;
}

/** Convierte YYYY-MM-DD a Date a las 12:00 local. */
export function dateKeyToNoonUtc(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Date → YYYY-MM-DD (componentes locales) para serialización. */
export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte YYYY-MM-DD a Date mediodía local. */
function ymdToNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Expande rango start..end (end exclusivo, regla hotel) a Date[]. */
function rangeToBlockedDates(startYmd: string, endYmd: string): Date[] {
  const start = ymdToNoon(startYmd);
  const end = ymdToNoon(endYmd);
  return eventToBlockedDates(start, end);
}

/** Expande rango start..end (end inclusivo) a Date[]. Para manual_blocks. */
function rangeToBlockedDatesInclusive(startYmd: string, endYmd: string): Date[] {
  const start = ymdToNoon(startYmd);
  const end = ymdToNoon(endYmd);
  const endNext = new Date(end);
  endNext.setDate(endNext.getDate() + 1);
  return eventToBlockedDates(start, endNext);
}

const EMPTY_BLOCKED: BlockedDatesByUnit = {
  room_1: [],
  room_2: [],
  full_villa: [],
};

/** Rango devuelto por la RPC get_occupied_dates; room_id opcional (si falta, se trata como full_villa). */
type OccupiedRange = { start_date: string; end_date: string; room_id?: string };

/** Dependencia: room_1 bloquea room_1 + full_villa; room_2 bloquea room_2 + full_villa; full_villa bloquea las tres. */
function addBlockedDatesByRoom(
  acc: { room_1: Set<number>; room_2: Set<number>; full_villa: Set<number> },
  roomId: string,
  dates: Date[]
): void {
  const timestamps = dates.map((d) => d.getTime());
  const room = (roomId === "room_1" || roomId === "room_2" || roomId === "full_villa" ? roomId : "full_villa") as PropertyUnit;
  if (room === "room_1") {
    timestamps.forEach((t) => { acc.room_1.add(t); acc.full_villa.add(t); });
  } else if (room === "room_2") {
    timestamps.forEach((t) => { acc.room_2.add(t); acc.full_villa.add(t); });
  } else {
    timestamps.forEach((t) => { acc.room_1.add(t); acc.room_2.add(t); acc.full_villa.add(t); });
  }
}

/** Fechas ocupadas vía RPC get_occupied_dates (con room_id); si falla, fallback a bookings con filtro por habitación y estado. */
async function getOccupiedDatesFromRpc(): Promise<BlockedDatesByUnit> {
  const acc = { room_1: new Set<number>(), room_2: new Set<number>(), full_villa: new Set<number>() };

  const { data, error } = await supabaseAdmin.rpc("get_occupied_dates");
  if (!error && Array.isArray(data) && data.length > 0) {
    for (const row of data as OccupiedRange[]) {
      const start = String(row.start_date);
      const end = String(row.end_date);
      const roomId = row.room_id ?? "full_villa";
      const dates = rangeToBlockedDates(start, end);
      addBlockedDatesByRoom(acc, roomId, dates);
    }
    return {
      room_1: [...acc.room_1].sort((a, b) => a - b).map((t) => new Date(t)),
      room_2: [...acc.room_2].sort((a, b) => a - b).map((t) => new Date(t)),
      full_villa: [...acc.full_villa].sort((a, b) => a - b).map((t) => new Date(t)),
    };
  }
  if (error) {
    console.warn("[ical] RPC get_occupied_dates falló:", error.message, "→ fallback a tabla bookings");
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: confirmed } = await supabaseAdmin
    .from("bookings")
    .select("check_in, check_out, room_id")
    .eq("status", "confirmed");
  const { data: pendingRecent } = await supabaseAdmin
    .from("bookings")
    .select("check_in, check_out, room_id")
    .eq("status", "pending_payment")
    .gte("created_at", thirtyMinutesAgo);
  const rows = [...(confirmed ?? []), ...(pendingRecent ?? [])];
  if (rows.length === 0) return EMPTY_BLOCKED;
  for (const row of rows) {
    const start = String(row.check_in);
    const end = String(row.check_out);
    const roomId = row.room_id ?? "full_villa";
    const dates = rangeToBlockedDates(start, end);
    addBlockedDatesByRoom(acc, roomId, dates);
  }
  return {
    room_1: [...acc.room_1].sort((a, b) => a - b).map((t) => new Date(t)),
    room_2: [...acc.room_2].sort((a, b) => a - b).map((t) => new Date(t)),
    full_villa: [...acc.full_villa].sort((a, b) => a - b).map((t) => new Date(t)),
  };
}

type ParsedCalendar = { eventCount: number; blockedDates: Date[] };

async function fetchAndParseCalendar(
  envKey: string,
  label: string
): Promise<ParsedCalendar> {
  const url = getIcalUrl(envKey);
  if (!url) {
    console.error(`[ical] ${label}: URL no definida — variable de entorno ${envKey} (o legacy) no configurada en Vercel`);
    return { eventCount: 0, blockedDates: [] };
  }
  const safeUrl = url.replace(/\?t=[^&]+/, "?t=***");
  console.log(`[ical] Leyendo ${label}: ${safeUrl}`);

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.log(`[ical] ${label}: HTTP ${res.status}`);
      return { eventCount: 0, blockedDates: [] };
    }
    const text = await res.text();
    const data =
      typeof (ical as { sync?: { parseICS: (s: string) => Record<string, unknown> } })
        .sync !== "undefined"
        ? (ical as { sync: { parseICS: (s: string) => Record<string, unknown> } })
            .sync.parseICS(text)
        : (ical as { parseICS: (s: string) => Record<string, unknown> }).parseICS(
            text
          );
    const typed = data as Record<
      string,
      { type?: string; start?: Date | string; end?: Date | string }
    >;

    const dateSet = new Set<number>();
    let eventCount = 0;

    for (const key of Object.keys(typed)) {
      const ev = typed[key];
      if (ev?.type !== "VEVENT" || ev.start == null || ev.end == null) continue;

      const startDate = ev.start instanceof Date ? ev.start : new Date(ev.start);
      const endDate = ev.end instanceof Date ? ev.end : new Date(ev.end);

      eventCount++;
      const blocked = eventToBlockedDates(startDate, endDate);
      blocked.forEach((d) => dateSet.add(d.getTime()));
    }

    const blockedDates = [...dateSet]
      .sort((a, b) => a - b)
      .map((t) => new Date(t));

    console.log(
      `[ical] ${label}: ${eventCount} eventos, ${blockedDates.length} fechas bloqueadas`
    );
    return { eventCount, blockedDates };
  } catch (e) {
    const reason = url
      ? `Error de red o parseo iCal (URL definida): ${e instanceof Error ? e.message : String(e)}`
      : `URL no definida (env ${envKey})`;
    console.error(`[ical] ${label}:`, reason, e);
    return { eventCount: 0, blockedDates: [] };
  }
}

function unionDates(...dateArrays: Date[][]): Date[] {
  const set = new Set<number>();
  for (const arr of dateArrays) {
    for (const d of arr) set.add(d.getTime());
  }
  return [...set].sort((a, b) => a - b).map((t) => new Date(t));
}

/**
 * Lógica Parent/Child por habitación:
 * - room_1: Room 1 + Full Villa
 * - room_2: Room 2 + Full Villa
 * - full_villa: Room 1 + Room 2 + Full Villa (cualquier ocupación bloquea la villa)
 */
export async function getBlockedDates(unit: PropertyUnit): Promise<Date[]> {
  const [room1, room2, full] = await Promise.all([
    fetchAndParseCalendar(ENV_ROOM1, "ROOM1"),
    fetchAndParseCalendar(ENV_ROOM2, "ROOM2"),
    fetchAndParseCalendar(ENV_FULL, "FULL"),
  ]);

  switch (unit) {
    case "room_1":
      return unionDates(room1.blockedDates, full.blockedDates);
    case "room_2":
      return unionDates(room2.blockedDates, full.blockedDates);
    case "full_villa":
      return unionDates(
        room1.blockedDates,
        room2.blockedDates,
        full.blockedDates
      );
    default:
      return [];
  }
}

/** Solo iCal Airbnb (sin reservas ni bloqueos manuales). */
async function getIcalBlockedDatesByUnit(): Promise<BlockedDatesByUnit> {
  const [room1, room2, full] = await Promise.all([
    fetchAndParseCalendar(ENV_ROOM1, "ROOM1"),
    fetchAndParseCalendar(ENV_ROOM2, "ROOM2"),
    fetchAndParseCalendar(ENV_FULL, "FULL"),
  ]);
  return {
    room_1: unionDates(room1.blockedDates, full.blockedDates),
    room_2: unionDates(room2.blockedDates, full.blockedDates),
    full_villa: unionDates(
      room1.blockedDates,
      room2.blockedDates,
      full.blockedDates
    ),
  };
}

/** Fechas ocupadas por Airbnb + RPC get_occupied_dates (para admin: mostrar en rojo). */
export async function getBlockedDatesFromIcalAndBookings(): Promise<BlockedDatesByUnit> {
  const [ical, occupied] = await Promise.all([
    getIcalBlockedDatesByUnit(),
    getOccupiedDatesFromRpc(),
  ]);
  return {
    room_1: unionDates(ical.room_1, occupied.room_1),
    room_2: unionDates(ical.room_2, occupied.room_2),
    full_villa: unionDates(ical.full_villa, occupied.full_villa),
  };
}

/** Fechas bloqueadas manualmente (para admin: gris). Sin SELECT directo; vacío hasta tener RPC get_manual_blocks si aplica. */
export async function getManualBlockedDatesByUnit(): Promise<BlockedDatesByUnit> {
  return EMPTY_BLOCKED;
}

export async function getBlockedDatesByUnit(): Promise<BlockedDatesByUnit> {
  const [ical, occupied] = await Promise.all([
    getIcalBlockedDatesByUnit(),
    getOccupiedDatesFromRpc(),
  ]);
  return {
    room_1: unionDates(ical.room_1, occupied.room_1),
    room_2: unionDates(ical.room_2, occupied.room_2),
    full_villa: unionDates(ical.full_villa, occupied.full_villa),
  };
}

export function blockedDatesToYmd(
  blocked: BlockedDatesByUnit
): Record<PropertyUnit, string[]> {
  return {
    room_1: blocked.room_1.map(toYmd),
    room_2: blocked.room_2.map(toYmd),
    full_villa: blocked.full_villa.map(toYmd),
  };
}
