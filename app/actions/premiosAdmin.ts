"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type AwardAdminRow = {
  id: string;
  image_url: string;
  position: number;
  created_at: string;
  title: string | null;
  year: number | null;
};

export type AwardActionState =
  | { success: true }
  | { success: false; error: string };

/** Lista todos los premios actuales ordenados por posición. */
export async function listAwards(): Promise<AwardAdminRow[]> {
  const { data, error } = await supabaseAdmin
    .from("awards")
    .select("id, image_url, position, created_at, title, year")
    .order("position", { ascending: true });

  if (error) {
    console.error("[listAwards]", error);
    return [];
  }
  return (data ?? []) as AwardAdminRow[];
}

/** Inserta un nuevo premio; calcula automáticamente la siguiente posición libre (1..10). */
export async function createAward(input: {
  title: string;
  year: number;
  imageUrl: string;
}): Promise<AwardActionState> {
  const title = input.title.trim();
  const imageUrl = input.imageUrl.trim();
  const year = input.year;

  if (!title || !imageUrl || !year) {
    return { success: false, error: "Título, año e imagen son obligatorios." };
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("awards")
    .select("position");

  if (existingError) {
    console.error("[createAward] read positions", existingError);
    return { success: false, error: existingError.message };
  }

  const positions = new Set<number>(
    (existing ?? []).map((r: { position: number }) => r.position)
  );
  let nextPos = 1;
  while (nextPos <= 10 && positions.has(nextPos)) nextPos += 1;
  if (nextPos > 10) {
    return {
      success: false,
      error: "Ya hay 10 premios configurados. Elimina uno para añadir otro.",
    };
  }

  const { error } = await supabaseAdmin.from("awards").insert({
    title,
    year,
    image_url: imageUrl,
    position: nextPos,
  });

  if (error) {
    console.error("[createAward]", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Elimina un premio por ID. */
export async function deleteAward(id: string): Promise<AwardActionState> {
  const { error } = await supabaseAdmin.from("awards").delete().eq("id", id);
  if (error) {
    console.error("[deleteAward]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

