"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  author_name: z.string().min(2).max(200),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional().or(z.literal("")),
  comment: z.string().max(3000).optional().or(z.literal("")),
  categories: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
});

export type SubmitReviewState = { success: true } | { success: false; error: string };

export async function submitReview(
  _prevState: SubmitReviewState | null,
  formData: FormData
): Promise<SubmitReviewState> {
  const raw = {
    booking_id: formData.get("booking_id"),
    author_name: formData.get("author_name"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") ?? "",
    comment: formData.get("comment") ?? "",
  };
  const categoriesRaw = formData.get("categories");
  let categories: Record<string, number> = {};
  if (typeof categoriesRaw === "string") {
    try {
      categories = JSON.parse(categoriesRaw) as Record<string, number>;
    } catch {
      // ignore
    }
  }

  const parsed = reviewSchema.safeParse({
    ...raw,
    title: raw.title === "" ? undefined : raw.title,
    comment: raw.comment === "" ? undefined : raw.comment,
    categories: Object.keys(categories).length ? categories : undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = Object.values(msg).flat().find(Boolean);
    return { success: false, error: (first as string) ?? "Datos inválidos." };
  }

  const data = parsed.data;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", data.booking_id)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Ya existe una opinión para esta reserva." };
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    booking_id: data.booking_id,
    author_name: data.author_name,
    rating: data.rating,
    title: data.title || null,
    comment: data.comment || null,
    categories: data.categories ?? null,
    status: "published",
  });

  if (insertError) {
    console.error("[submitReview] Supabase:", insertError);
    return { success: false, error: "No se pudo publicar la opinión. Inténtalo de nuevo." };
  }

  return { success: true };
}
