import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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

export async function POST(request: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { success: false, error: "Supabase no configurado en el servidor." },
        { status: 503 }
      );
    }

    const formData = await request.formData();

    const idRaw = formData.get("id");
    const id = typeof idRaw === "string" ? idRaw.trim() : "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID inválido." },
        { status: 400 }
      );
    }

    const titleRaw = formData.get("title");
    const slugRaw = formData.get("slug");
    const category =
      String(formData.get("category") ?? "").trim() || "Sin categoría";
    const content = String(formData.get("content") ?? "");
    const instagramUrlRaw =
      formData.get("instagram_url") ?? formData.get("instagramUrl");
    const instagramUrl =
      typeof instagramUrlRaw === "string" ? instagramUrlRaw.trim() : "";
    const status = String(formData.get("status") ?? "publicado").trim();
    const isRedirect = parseBool(formData.get("is_redirect"));

    const coverImagePresent = parseBool(formData.get("coverImagePresent"));
    const galleryImage1Present = parseBool(
      formData.get("galleryImage1Present")
    );
    const galleryImage2Present = parseBool(
      formData.get("galleryImage2Present")
    );

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    let slug =
      typeof slugRaw === "string" && slugRaw.trim()
        ? slugify(slugRaw)
        : slugify(title);

    const coverImageFile = getFile(formData, "coverImage", "image");
    const galleryImage1File = getFile(formData, "galleryImage1");
    const galleryImage2File = getFile(formData, "galleryImage2");

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

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("posts")
      .select("id, media_url, media_type, gallery_urls")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "No se encontró la publicación." },
        { status: 404 }
      );
    }

    const isEmptyContent =
      !content.trim() ||
      content.trim() === "<p><br></p>" ||
      content.trim() === "<p></p>";

    if (!isRedirect && isEmptyContent) {
      return NextResponse.json(
        { success: false, error: "Título y contenido son obligatorios." },
        { status: 400 }
      );
    }

    async function uploadToBlogMedia(file: File): Promise<string | null> {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${Date.now()}-${slugify(file.name.slice(0, 40))}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("blog-media")
        .upload(safeName, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("[api/update-post] Storage:", uploadError);
        return null;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("blog-media")
        .getPublicUrl(uploadData.path);

      return urlData.publicUrl;
    }

    const existingMediaUrl: string | null = existing.media_url ?? null;
    const existingGalleryUrls: string[] = Array.isArray(existing.gallery_urls)
      ? existing.gallery_urls
      : [];

    const existingGallery1 = existingGalleryUrls[0] ?? null;
    const existingGallery2 = existingGalleryUrls[1] ?? null;

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    if (coverImagePresent) {
      if (coverImageFile) {
        mediaUrl = await uploadToBlogMedia(coverImageFile);
        if (!mediaUrl) {
          return NextResponse.json(
            { success: false, error: "No se pudo subir la imagen de portada." },
            { status: 500 }
          );
        }
      } else {
        mediaUrl = existingMediaUrl;
      }
      mediaType = mediaUrl ? "image" : null;
    }

    const galleryUrls: string[] = [];
    if (galleryImage1Present) {
      if (galleryImage1File) {
        const url = await uploadToBlogMedia(galleryImage1File);
        if (url) galleryUrls.push(url);
      } else if (existingGallery1) {
        galleryUrls.push(existingGallery1);
      }
    }
    if (galleryImage2Present) {
      if (galleryImage2File) {
        const url = await uploadToBlogMedia(galleryImage2File);
        if (url) galleryUrls.push(url);
      } else if (existingGallery2) {
        galleryUrls.push(existingGallery2);
      }
    }

    const galleryUrlsToStore = galleryUrls.length ? galleryUrls : null;

    if (isRedirect) {
      if (!instagramUrl || !isValidHttpUrl(instagramUrl)) {
        return NextResponse.json(
          {
            success: false,
            error: "Indica un enlace de redirección válido (https://…).",
          },
          { status: 400 }
        );
      }

      if (!mediaUrl) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Con redirección directa activa, la foto de portada es obligatoria.",
          },
          { status: 400 }
        );
      }
    }

    const baseSlug = slug;
    let attempt = 0;
    while (true) {
      const { data: existingSlug } = await supabaseAdmin
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!existingSlug || existingSlug.id === id) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const excerpt =
      status === "borrador"
        ? `[Borrador] ${category}`
        : `Categoría: ${category}`;

    const contentToStore = isRedirect
      ? content.trim() && content !== "<p><br></p>" ? content : null
      : content;

    const updatePayload: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content: contentToStore,
      media_url: coverImagePresent ? mediaUrl : null,
      media_type: coverImagePresent ? mediaType : null,
      type: isRedirect ? "redirect" : "standard",
      instagram_url: isRedirect ? instagramUrl : instagramUrl || null,
      gallery_urls: galleryUrlsToStore,
      is_redirect: isRedirect,
    };

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("[api/update-post] Supabase update:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    revalidatePath("/descubre");
    revalidatePath("/admin/publicar");
    revalidatePath("/admin/editar-publicaciones");

    return NextResponse.json(
      {
        success: true,
        message: "Publicación actualizada correctamente.",
        slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en API /api/update-post:", error);
    const msg = error instanceof Error ? error.message : "Fallo interno del servidor.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

