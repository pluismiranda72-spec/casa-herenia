"use client";

import { useState, useCallback, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import type { PropertyUnit } from "@/lib/ical";
import {
  getManualBlocksForRoom,
  blockDates,
  unblockDates,
  type ManualBlockRow,
} from "@/app/actions/manageCalendar";
import "react-day-picker/style.css";

/** Expande bloques a set de YYYY-MM-DD por habitación. */
function blocksToYmdByUnit(
  blocks: Record<PropertyUnit, ManualBlockRow[]>
): Record<PropertyUnit, string[]> {
  const out: Record<PropertyUnit, string[]> = { room_1: [], room_2: [], full_villa: [] };
  for (const unit of ["room_1", "room_2", "full_villa"] as PropertyUnit[]) {
    const set = new Set<string>();
    for (const b of blocks[unit] ?? []) {
      let d = b.start_date;
      while (d <= b.end_date) {
        set.add(d);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        d = next.toISOString().slice(0, 10);
      }
    }
    out[unit] = [...set].sort();
  }
  return out;
}

type BlockedDatesByUnitYmd = Record<PropertyUnit, string[]>;

const ROOM_OPTIONS: { value: PropertyUnit; label: string }[] = [
  { value: "room_1", label: "Junior Suite I" },
  { value: "room_2", label: "Junior Suite II" },
  { value: "full_villa", label: "Villa completa" },
];

function dateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function findBlockContainingDate(
  blocks: ManualBlockRow[],
  ymd: string
): ManualBlockRow | null {
  for (const b of blocks) {
    if (ymd >= b.start_date && ymd <= b.end_date) return b;
  }
  return null;
}

type Props = {
  occupiedYmd: BlockedDatesByUnitYmd;
  manualYmd: BlockedDatesByUnitYmd;
  initialManualBlocks: Record<PropertyUnit, ManualBlockRow[]>;
};

export default function AdminCalendarioClient({
  occupiedYmd: initialOccupied,
  manualYmd: initialManual,
  initialManualBlocks,
}: Props) {
  const [roomId, setRoomId] = useState<PropertyUnit>("room_1");
  const [blockRange, setBlockRange] = useState<{ from?: Date; to?: Date }>({});
  const [manualBlocks, setManualBlocks] = useState<Record<PropertyUnit, ManualBlockRow[]>>(
    initialManualBlocks
  );
  const [occupiedYmd] = useState(initialOccupied);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [unblockTarget, setUnblockTarget] = useState<{ ymd: string; block: ManualBlockRow } | null>(null);

  const manualYmd = useMemo(
    () => blocksToYmdByUnit(manualBlocks),
    [manualBlocks]
  );

  const refreshManual = useCallback(async () => {
    const [r1, r2, r3] = await Promise.all([
      getManualBlocksForRoom("room_1"),
      getManualBlocksForRoom("room_2"),
      getManualBlocksForRoom("full_villa"),
    ]);
    setManualBlocks({ room_1: r1, room_2: r2, full_villa: r3 });
  }, []);

  const occupiedSet = new Set(occupiedYmd[roomId] ?? []);
  const manualSet = new Set(manualYmd[roomId] ?? []);
  const blocks = manualBlocks[roomId] ?? [];

  const handleBlock = async () => {
    if (!blockRange.from) return;
    const start = dateToKey(blockRange.from);
    const end = blockRange.to ? dateToKey(blockRange.to) : start;
    setPending(true);
    setMessage(null);
    const result = await blockDates(roomId, start, end);
    setPending(false);
    if (result.success) {
      setMessage({ type: "ok", text: "Fechas bloqueadas." });
      setBlockRange({});
      await refreshManual();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  };

  const handleUnblock = async () => {
    if (!unblockTarget) return;
    setPending(true);
    setMessage(null);
    const result = await unblockDates(unblockTarget.block.id);
    setPending(false);
    setUnblockTarget(null);
    if (result.success) {
      setMessage({ type: "ok", text: "Fechas desbloqueadas." });
      await refreshManual();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  };

  const handleDayClick = (date: Date) => {
    const ymd = dateToKey(date);
    if (!manualSet.has(ymd)) return;
    if (occupiedSet.has(ymd)) return;
    const block = findBlockContainingDate(blocks, ymd);
    if (block) setUnblockTarget({ ymd, block });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ROOM_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRoomId(opt.value)}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
              roomId === opt.value
                ? "bg-[#C5A059] text-[#0A0A0A]"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2 font-sans text-sm text-white/80">
          <span className="w-4 h-4 rounded bg-red-600/80" /> Ocupado (Airbnb/Reservas)
        </span>
        <span className="flex items-center gap-2 font-sans text-sm text-white/80">
          <span className="w-4 h-4 rounded bg-gray-600" /> Bloqueo manual
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <DayPicker
          mode="range"
          defaultMonth={new Date()}
          selected={blockRange}
          onSelect={(r) => setBlockRange(r ?? {})}
          onDayClick={handleDayClick}
          modifiers={{
            occupied: (d) => occupiedSet.has(dateToKey(d)),
            manual: (d) => manualSet.has(dateToKey(d)),
          }}
          modifiersClassNames={{
            occupied: "!bg-red-600/80 !text-white",
            manual: "!bg-gray-600 !text-white cursor-pointer hover:ring-2 hover:ring-[#C5A059]",
            selected: "!bg-[#C5A059] !text-[#0A0A0A]",
            range_start: "!bg-[#C5A059] !text-[#0A0A0A]",
            range_end: "!bg-[#C5A059] !text-[#0A0A0A]",
            range_middle: "!bg-[#C5A059]/80 !text-[#0A0A0A]",
            today: "text-[#C5A059] font-semibold",
          }}
          className="text-white [--rdp-accent:#C5A059]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleBlock}
          disabled={pending || !blockRange.from}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          BLOQUEAR FECHAS
        </button>
        {blockRange.from && (
          <span className="font-sans text-sm text-white/70">
            Rango: {dateToKey(blockRange.from)}
            {blockRange.to && ` → ${dateToKey(blockRange.to)}`}
          </span>
        )}
      </div>

      {message && (
        <p
          className={`font-sans text-sm ${
            message.type === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      {unblockTarget && (
        <div className="rounded-lg border border-[#C5A059]/50 bg-white/5 p-4 flex flex-wrap items-center gap-3">
          <span className="font-sans text-sm text-white/90">
            Bloqueo manual {unblockTarget.block.start_date} → {unblockTarget.block.end_date}
            {unblockTarget.block.reason && ` (${unblockTarget.block.reason})`}
          </span>
          <button
            type="button"
            onClick={handleUnblock}
            disabled={pending}
            className="px-4 py-2 rounded-lg border border-red-500/80 text-red-400 font-sans text-sm hover:bg-red-500/20 disabled:opacity-50"
          >
            DESBLOQUEAR / ABRIR
          </button>
          <button
            type="button"
            onClick={() => setUnblockTarget(null)}
            className="px-4 py-2 rounded-lg border border-white/30 text-white/80 font-sans text-sm hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
