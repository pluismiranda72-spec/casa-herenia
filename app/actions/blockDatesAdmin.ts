"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type PropertyUnit = "room_1" | "room_2" | "full_villa";

const MANUAL_BLOCK_GUEST_NAME = "Bloqueo Manual Directo";

export type ManualBlockBookingRow = {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  status: string;
};

export type InsertBlockState = { success: true } | { success: false; error: string };
export type DeleteBlockState = { success: true } | { success: false; error: string };

/** Inserta un bloqueo manual como reserva en bookings (status confirmed, guest_name fijo). */
export async function insertManualBlock(
  roomId: PropertyUnit,
  checkIn: string,
  checkOut: string
): Promise<InsertBlockState> {
  if (!checkIn || !checkOut) return { success: false, error: "Fechas requeridas." };
  if (checkOut <= checkIn) return { success: false, error: "La fecha de salida debe ser posterior al check-in." };

  const { error } = await supabaseAdmin.from("bookings").insert({
    room_id: roomId,
    check_in: checkIn,
    check_out: checkOut,
    status: "confirmed",
    guest_name: MANUAL_BLOCK_GUEST_NAME,
    guest_email: "admin@bloqueo.local",
    guests_count: 0,
    total_price: 0,
  });

  if (error) {
    console.error("[insertManualBlock]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Elimina un bloqueo manual (borra la fila de bookings por id). */
export async function deleteManualBlock(bookingId: string): Promise<DeleteBlockState> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("guest_name", MANUAL_BLOCK_GUEST_NAME);

  if (error) {
    console.error("[deleteManualBlock]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Lista los bloqueos manuales actuales (bookings con guest_name = Bloqueo Manual Directo). */
export async function getManualBlockBookings(): Promise<ManualBlockBookingRow[]> {
  const { data } = await supabaseAdmin
    .from("bookings")
    .select("id, room_id, check_in, check_out, guest_name, status")
    .eq("guest_name", MANUAL_BLOCK_GUEST_NAME)
    .order("check_in", { ascending: false });

  return (data ?? []) as ManualBlockBookingRow[];
}
