import ical from "node-ical";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type PropertyUnit = "room_1" | "room_2" | "full_villa";

/** Fechas bloqueadas por unidad: array de Date (12:00 local) para react-day-picker. */
export type BlockedDatesByUnit = Record<PropertyUnit, Date[]>;

/** Formato serializado para la API: YYYY-MM-DD por unidad. */
export type BlockedDatesByUnitYmd = Record<PropertyUnit, string[]>;

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

/** Rango devuelto por la RPC get_occupied_dates (RGPD: sin acceso directo a bookings/manual_blocks). */
type OccupiedRange = { start_date: string; end_date: string };

/** Fechas ocupadas vía RPC segura get_occupied_dates (sustituye SELECT a bookings y manual_blocks). */
async function getOccupiedDatesFromRpc(): Promise<BlockedDatesByUnit> {
  const supabase = createServiceRoleClient();
  if (!supabase) return EMPTY_BLOCKED;

  const { data, error } = await supabase.rpc("get_occupied_dates");
  if (error || !Array.isArray(data) || data.length === 0) return EMPTY_BLOCKED;

  const allDates = new Set<number>();
  for (const row of data as OccupiedRange[]) {
    const start = String(row.start_date);
    const end = String(row.end_date);
    const dates = rangeToBlockedDates(start, end);
    dates.forEach((d) => allDates.add(d.getTime()));
  }
  const dateList = [...allDates].sort((a, b) => a - b).map((t) => new Date(t));

  return {
    room_1: [...dateList],
    room_2: [...dateList],
    full_villa: [...dateList],
  };
}

type ParsedCalendar = { eventCount: number; blockedDates: Date[] };

async function fetchAndParseCalendar(
  envKey: string,
  label: string
): Promise<ParsedCalendar> {
  const url = getIcalUrl(envKey);
  if (!url) {
    console.log(`[ical] ${label}: no URL (env ${envKey} no definida)`);
    return { eventCount: 0, blockedDates: [] };
  }
  const safeUrl = url.replace(/\?t=[^&]+/, "?t=***");
  console.log(`[ical] Leyendo ${label}: ${safeUrl}`);

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
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
    console.log(`[ical] ${label}: error`, e);
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
