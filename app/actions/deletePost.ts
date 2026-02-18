"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * Extrae el path del objeto en el bucket desde la URL pública de Supabase Storage.
 * Ej: "https://xxx.supabase.co/storage/v1/object/public/blog-media/123-foto.jpg" -> "123-foto.jpg"
 */
function getStoragePathFromPublicUrl(publicUrl: string | null): string | null {
  if (!publicUrl || typeof publicUrl !== "string") return null;
  const match = publicUrl.match(/\/blog-media\/(.+)$/);
  return match ? match[1] : null;
}

export type DeletePostState = { success: true } | { success: false; error: string };

export async function deletePost(id: string): Promise<DeletePostState> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { success: false, error: "Servidor no configurado (service role)." };
  }

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, media_url")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "No se encontró la publicación." };
  }

  const storagePath = getStoragePathFromPublicUrl(post.media_url ?? null);
  if (storagePath) {
    await supabase.storage.from("blog-media").remove([storagePath]);
  }

  const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);

  if (deleteError) {
    console.error("[deletePost]", deleteError);
    return { success: false, error: "No se pudo eliminar la publicación." };
  }

  revalidatePath("/descubre");
  revalidatePath("/admin/publicar");
  return { success: true };
}
