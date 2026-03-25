import { createServiceRoleClient } from "@/lib/supabase/admin";
import EditarPublicacionClient from "../EditarPublicacionClient";

const CATEGORIES = [
  "Escalada",
  "Cultura Local",
  "Gastronomía",
  "Novedades Casa",
  "Tabaco",
] as const;

type PublicationRow = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  type: string | null;
  instagram_url: string | null;
  gallery_urls: string[] | null;
  title_en: string | null;
  content_en: string | null;
  excerpt_en: string | null;
  is_redirect: boolean | null;
  created_at: string | null;
};

function parseCategoryAndStatus(excerpt: string | null) {
  const ex = excerpt ?? "";
  const borrMatch = ex.match(/^\[Borrador\]\s*(.*)$/i);
  if (borrMatch?.[1]) {
    return { status: "borrador" as const, category: borrMatch[1].trim() };
  }

  const catMatch = ex.match(/^Categoría:\s*(.*)$/i);
  if (catMatch?.[1]) {
    return { status: "publicado" as const, category: catMatch[1].trim() };
  }

  return { status: "publicado" as const, category: ex.trim() || CATEGORIES[0] };
}

function safeCategory(category: string) {
  return (CATEGORIES as readonly string[]).includes(category)
    ? category
    : CATEGORIES[0];
}

function DbErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 bg-slate-950">
      <div
        role="alert"
        className="max-w-4xl w-full rounded-2xl border-4 border-red-500 bg-red-950/40 p-10 text-center"
      >
        <p className="text-3xl md:text-4xl font-black text-red-200 leading-tight break-words">
          Error cargando publicación: {message}
        </p>
      </div>
    </div>
  );
}

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditarPublicacionPage({ params }: PageProps) {
  const { id } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const msg =
      "Supabase no configurado en el servidor (falta URL o SUPABASE_SERVICE_ROLE_KEY).";
    console.error("Error BD:", msg);
    return <DbErrorScreen message={msg} />;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    const msg = "No se pudo crear el cliente de servicio (service role).";
    console.error("Error BD:", msg);
    return <DbErrorScreen message={msg} />;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id,title,slug,excerpt,content,media_url,media_type,type,instagram_url,gallery_urls,is_redirect,title_en,content_en,excerpt_en,created_at"
    )
    .eq("id", id)
    .maybeSingle<PublicationRow>();

  if (error) {
    console.error("Error BD:", error);
    return (
      <DbErrorScreen
        message={error.message || "Error desconocido de Supabase"}
      />
    );
  }

  if (!post) {
    console.error("Error BD:", "No data (0 filas en posts para id=", id, ")");
    return <DbErrorScreen message="No data" />;
  }

  const parsed = parseCategoryAndStatus(post.excerpt);

  const status = parsed.status;
  const category = safeCategory(parsed.category);

  const isRedirect =
    typeof post.is_redirect === "boolean"
      ? post.is_redirect
      : post.type === "redirect";

  const galleryUrls = Array.isArray(post.gallery_urls) ? post.gallery_urls : [];

  return (
    <EditarPublicacionClient
      id={post.id}
      initial={{
        title: post.title ?? "",
        slug: post.slug ?? "",
        status,
        category,
        isRedirect,
        content: post.content ?? "",
        instagramUrl: post.instagram_url ?? "",
        coverImagePreview: post.media_url ?? null,
        galleryImage1Preview: galleryUrls[0] ?? null,
        galleryImage2Preview: galleryUrls[1] ?? null,
      }}
    />
  );
}
