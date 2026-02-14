"use server";

import { createClient } from "@/lib/supabase/server";

const SLOT_COUNT = 8;
const EMPTY_IMAGES: (string | null)[] = Array(SLOT_COUNT).fill(null);

function normalizeImages(raw: unknown): (string | null)[] {
  if (!Array.isArray(raw)) return [...EMPTY_IMAGES];
  const out: (string | null)[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const v = raw[i];
    out.push(typeof v === "string" && v.length > 0 ? v : null);
  }
  while (out.length < SLOT_COUNT) out.push(null);
  return out.slice(0, SLOT_COUNT);
}

/** Devuelve el array de 8 imágenes para la habitación. Si no hay registro, devuelve 8 null. */
export async function getGallery(
  roomSlug: string
): Promise<(string | null)[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_galleries")
    .select("images")
    .eq("room_slug", roomSlug)
    .maybeSingle();

  if (error) return [...EMPTY_IMAGES];
  return normalizeImages(data?.images ?? null);
}

/** Guarda una URL (o null para borrar) en la posición index (0-7). Hace upsert en room_galleries. */
export async function saveImage(
  roomSlug: string,
  index: number,
  imageUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  if (index < 0 || index >= SLOT_COUNT) {
    return { success: false, error: "Índice inválido" };
  }

  const supabase = await createClient();
  const current = await getGallery(roomSlug);
  const next = [...current];
  next[index] = imageUrl;

  const { error } = await supabase
    .from("room_galleries")
    .upsert(
      { room_slug: roomSlug, images: next },
      { onConflict: "room_slug" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
