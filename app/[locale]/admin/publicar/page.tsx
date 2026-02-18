"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { deletePost } from "@/app/actions/deletePost";
import { Trash2 } from "lucide-react";
import PublishForm from "./PublishForm";

type Post = {
  id: string;
  title: string;
  slug: string;
  media_url: string | null;
  created_at: string;
  [key: string]: unknown;
};

export default function PublicarPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  async function handleDelete(id: string) {
    const ok = window.confirm("¿Estás seguro de que quieres eliminar esta historia?");
    if (!ok) return;
    const result = await deletePost(id);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(result.error);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-[#C5A059] mb-8 text-center">
          Publicar en Descubre Viñales
        </h1>
        <PublishForm />

        <div className="mt-16">
          <h2 className="font-serif text-xl text-[#C5A059] mb-4">Gestión de Publicaciones</h2>
          {posts.length === 0 ? (
            <p className="font-sans text-sm text-white/60">No hay publicaciones aún.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  <div className="relative w-full aspect-[4/3] bg-[#1a1a1a]">
                    {post.media_url ? (
                      <Image
                        src={post.media_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
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
                      className="absolute top-2 right-2 z-10 bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      aria-label="Eliminar esta historia"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="p-2 font-sans text-xs text-white/80 line-clamp-2" title={post.title}>
                    {post.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
