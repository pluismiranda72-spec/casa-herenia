import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getFile(formData: FormData, ...keys: string[]): File | null {
  for (const key of keys) {
    const v = formData.get(key);
    if (v instanceof File && v.size > 0) return v;
  }
  return null;
}

function parseBool(v: FormDataEntryValue | null): boolean {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "on" || s === "yes";
}

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * POST /api/publish
 * Acepta multipart/form-data con título, slug, categoría, contenido, estado, imágenes opcionales.
 * Compatible con nombres: coverImage | image, galleryImage1, galleryImage2, instagramUrl.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: "Supabase no configurado en el servidor." },
        { status: 503 }
      );
    }

    const formData = await request.formData();

    const titleRaw = formData.get("title");
    const slugRaw = formData.get("slug");
    const category = String(formData.get("category") ?? "").trim() || "Sin categoría";
    const content = String(formData.get("content") ?? "");
    const instagramUrlRaw =
      formData.get("instagram_url") ?? formData.get("instagramUrl");
    const instagramUrl =
      typeof instagramUrlRaw === "string" ? instagramUrlRaw.trim() : "";
    const status = String(formData.get("status") ?? "publicado").trim();
    const isRedirect = parseBool(formData.get("is_redirect"));

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    let slug =
      typeof slugRaw === "string" && slugRaw.trim()
        ? slugify(slugRaw)
        : slugify(title);

    if (!title) {
      return NextResponse.json(
        { success: false, error: "El título es obligatorio." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "No se pudo generar un slug válido." },
        { status: 400 }
      );
    }

    const coverImage = getFile(formData, "coverImage", "image");

    if (isRedirect) {
      if (!instagramUrl || !isValidHttpUrl(instagramUrl)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Con redirección directa activa, el enlace de Instagram (URL válida https) es obligatorio.",
          },
          { status: 400 }
        );
      }
      if (!coverImage) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Con redirección directa activa, la foto de portada es obligatoria.",
          },
          { status: 400 }
        );
      }
    } else {
      const emptyContent =
        !content.trim() || content.trim() === "<p><br></p>" || content.trim() === "<p></p>";
      if (emptyContent) {
        return NextResponse.json(
          { success: false, error: "Título y contenido son obligatorios." },
          { status: 400 }
        );
      }
    }
    const galleryImage1 = getFile(formData, "galleryImage1");
    const galleryImage2 = getFile(formData, "galleryImage2");

    async function uploadToBlogMedia(file: File): Promise<string | null> {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${Date.now()}-${slugify(file.name.slice(0, 40))}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("blog-media")
        .upload(safeName, file, { contentType: file.type || "image/jpeg", upsert: false });

      if (uploadError) {
        console.error("[api/publish] Storage:", uploadError);
        return null;
      }
      const { data: urlData } = supabaseAdmin.storage.from("blog-media").getPublicUrl(uploadData.path);
      return urlData.publicUrl;
    }

    let mediaUrl: string | null = null;
    const galleryUrls: string[] = [];

    if (coverImage) {
      mediaUrl = await uploadToBlogMedia(coverImage);
      if (!mediaUrl) {
        return NextResponse.json(
          { success: false, error: "No se pudo subir la imagen de portada." },
          { status: 500 }
        );
      }
    }

    for (const file of [galleryImage1, galleryImage2]) {
      if (!file) continue;
      const url = await uploadToBlogMedia(file);
      if (url) galleryUrls.push(url);
    }

    const baseSlug = slug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const excerpt =
      status === "borrador"
        ? `[Borrador] ${category}`
        : `Categoría: ${category}`;

    const contentToStore = isRedirect
      ? content.trim() && content !== "<p><br></p>"
        ? content
        : null
      : content;

    const insertPayload: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content: contentToStore,
      media_url: mediaUrl,
      media_type: mediaUrl ? "image" : null,
      type: isRedirect ? "redirect" : "standard",
      instagram_url: isRedirect ? instagramUrl : instagramUrl || null,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      title_en: null,
      content_en: null,
      excerpt_en: null,
    };

    insertPayload.is_redirect = isRedirect;

    const { error: insertError } = await supabaseAdmin.from("posts").insert(insertPayload);

    if (insertError) {
      console.error("[api/publish] Supabase insert:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    console.log(
      `[API/publish] OK: "${title}" slug=${slug} portada=${mediaUrl ? "sí" : "no"} galería=${galleryUrls.length}`
    );
    if (instagramUrl) console.log(`[API/publish] Instagram: ${instagramUrl}`);

    return NextResponse.json(
      {
        success: true,
        message: "Publicación guardada correctamente.",
        slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en API /api/publish:", error);
    const msg = error instanceof Error ? error.message : "Fallo interno del servidor.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
