"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const createPostSchema = z.object({
  title: z.string().min(1).max(300),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  media_type: z.enum(["image", "video"]),
  post_type: z.enum(["standard", "instagram"]),
  instagram_url: z.string().url().optional().or(z.literal("")),
});

export type CreatePostState = { success: true; slug?: string } | { success: false; error: string };

export async function createPost(
  _prevState: CreatePostState | null,
  formData: FormData
): Promise<CreatePostState> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { success: false, error: "Servidor no configurado (service role)." };
  }

  const title = formData.get("title") as string | null;
  const excerpt = (formData.get("excerpt") as string) ?? "";
  const content = (formData.get("content") as string) ?? "";
  const mediaType = formData.get("media_type") as string | null;
  const file = formData.get("media") as File | null;
  const postType = (formData.get("post_type") as string) || "standard";
  const instagramUrl = (formData.get("instagram_url") as string)?.trim() || null;

  const parsed = createPostSchema.safeParse({
    title: title ?? "",
    excerpt: excerpt || undefined,
    content: content || undefined,
    media_type: mediaType === "video" ? "video" : "image",
    post_type: postType === "instagram" ? "instagram" : "standard",
    instagram_url: instagramUrl || undefined,
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat().find(Boolean);
    return { success: false, error: (first as string) ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const isInstagram = data.post_type === "instagram";
  if (isInstagram && !data.instagram_url) {
    return { success: false, error: "URL de Instagram obligatoria para tipo Embeber Instagram." };
  }

  if (isInstagram && (!file || file.size === 0)) {
    return { success: false, error: "La foto de portada es obligatoria para posts de Instagram." };
  }

  let mediaUrl: string | null = null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${Date.now()}-${slugify(file.name.slice(0, 20))}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(safeName, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[createPost] Storage:", uploadError);
      return { success: false, error: "No se pudo subir el archivo." };
    }
    const { data: urlData } = supabase.storage.from("blog-media").getPublicUrl(uploadData.path);
    mediaUrl = urlData.publicUrl;
  }

  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error: insertError } = await supabase.from("posts").insert({
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content || null,
    media_url: mediaUrl,
    media_type: isInstagram ? "image" : data.media_type,
    type: data.post_type,
    instagram_url: isInstagram ? data.instagram_url || null : null,
  });

  if (insertError) {
    console.error("[createPost] Insert:", insertError);
    return { success: false, error: "No se pudo crear la entrada." };
  }
  return { success: true, slug };
}
