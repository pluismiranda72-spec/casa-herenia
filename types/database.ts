/**
 * Tipos para modelos de Supabase (bookings, reviews, guests).
 * Ajustar según el schema real de la base de datos.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PropertyUnit = "habitacion_1" | "habitacion_2" | "pack_completo";

export interface Booking {
  id: string;
  unit: PropertyUnit;
  check_in: string;
  check_out: string;
  guest_id: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id?: string;
  guest_name: string;
  rating: number;
  comment: string;
  date: string;
  created_at: string;
}

export interface Guest {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
