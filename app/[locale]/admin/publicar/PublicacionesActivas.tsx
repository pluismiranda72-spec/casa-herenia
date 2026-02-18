"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions/deletePost";

export type PostForAdmin = {
  id: string;
  title: string;
  slug: string;
  media_url: string | null;
  created_at: string;
};

export default function PublicacionesActivas({ posts }: { posts: PostForAdmin[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const ok = confirm("¿Estás seguro de que quieres eliminar esta historia?");
    if (!ok) return;
    setDeletingId(id);
    const result = await deletePost(id);
    setDeletingId(null);
    if (result.success) {
      setToast("Historia eliminada.");
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  if (posts.length === 0) {
    return (
      <section className="mt-12 pt-8 border-t border-white/20">
        <h2 className="font-serif text-xl text-[#C5A059] mb-4">Publicaciones Activas</h2>
        <p className="font-sans text-sm text-white/60">No hay publicaciones aún.</p>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-white/20">
      <h2 className="font-serif text-xl text-[#C5A059] mb-4">Publicaciones Activas</h2>

      {toast && (
        <div
          className="mb-4 px-4 py-2 rounded-lg bg-green-900/50 text-green-300 font-sans text-sm border border-green-600/30"
          role="status"
        >
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10 group"
          >
            <div className="relative w-full aspect-[4/3] bg-[#1a1a1a]">
              {post.media_url ? (
                <Image
                  src={post.media_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 200px"
                  unoptimized={post.media_url.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C5A059]/50 font-serif text-xs">
                  Sin imagen
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Eliminar esta historia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="p-2 font-sans text-xs text-white/80 line-clamp-2" title={post.title}>
              {post.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
