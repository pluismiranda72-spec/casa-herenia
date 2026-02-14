"use server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { PropertyUnit } from "@/lib/ical";

export type ManualBlockRow = {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};

/** Lista de bloqueos manuales de una habitación (para admin). */
export async function getManualBlocksForRoom(
  roomId: PropertyUnit
): Promise<ManualBlockRow[]> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("manual_blocks")
    .select("id, room_id, start_date, end_date, reason")
    .eq("room_id", roomId)
    .order("start_date", { ascending: true });

  return (data ?? []) as ManualBlockRow[];
}

export type BlockDatesState =
  | { success: true }
  | { success: false; error: string };

/** Inserta un bloqueo manual para un rango de fechas. */
export async function blockDates(
  roomId: PropertyUnit,
  startDate: string,
  endDate: string,
  reason?: string
): Promise<BlockDatesState> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { success: false, error: "Servidor no configurado." };

  if (!startDate || !endDate) return { success: false, error: "Fechas requeridas." };
  if (endDate < startDate) return { success: false, error: "La fecha fin debe ser igual o posterior al inicio." };

  const { error } = await supabase.from("manual_blocks").insert({
    room_id: roomId,
    start_date: startDate,
    end_date: endDate,
    reason: reason?.trim() || null,
  });

  if (error) {
    console.error("[blockDates]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export type UnblockDatesState =
  | { success: true }
  | { success: false; error: string };

/** Elimina un bloqueo manual por ID. */
export async function unblockDates(blockId: string): Promise<UnblockDatesState> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { success: false, error: "Servidor no configurado." };

  const { error } = await supabase
    .from("manual_blocks")
    .delete()
    .eq("id", blockId);

  if (error) {
    console.error("[unblockDates]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
