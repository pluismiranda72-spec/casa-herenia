import { createClient } from "@/lib/supabase/server";
import PublicacionesAdminClient from "./PublicacionesAdminClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EditarPublicacionesPage({ params }: PageProps) {
  await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, media_url, media_type, created_at")
    .order("created_at", { ascending: false });

  // Si falla la carga (RLS/permisos), devolvemos lista vacía para no romper el panel.
  const initialPosts =
    error || !data
      ? []
      : (data as Array<{
          id: string;
          title: string | null;
          media_url: string | null;
          media_type: string | null;
          created_at: string | null;
        }>);

  return <PublicacionesAdminClient initialPosts={initialPosts} />;
}

