"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  media_url: string | null;
  media_type: string | null;
};

export default function ViñalesMiniWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("id, title, slug, media_url, media_type")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  useEffect(() => {
    if (posts.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % posts.length), 4000);
    return () => clearInterval(t);
  }, [posts.length]);

  // Siempre visible: si no hay posts mostramos mensaje "Próximamente"
  const hasPosts = posts.length > 0;

  return (
    <section
      className="w-full bg-[#0A0A0A]/95 border-t border-[#C5A059]/20 py-6 px-4"
      aria-label="Descubre Viñales"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="relative w-[200px] h-[120px] rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a]">
            <AnimatePresence mode="wait">
              {hasPosts && posts[index] ? (
                <motion.div
                  key={posts[index].id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {posts[index].media_url && posts[index].media_type === "image" ? (
                    <Image
                      src={posts[index].media_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="200px"
                      unoptimized={posts[index].media_url.startsWith("http")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C5A059]/60 font-serif text-sm">
                      Viñales
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#C5A059]/70 font-serif text-sm text-center px-3">
                  Próximamente nuevas historias
                </div>
              )}
            </AnimatePresence>
          </div>
          <div className="min-w-0 max-w-[220px]">
            <AnimatePresence mode="wait">
              {hasPosts && posts[index] ? (
                <motion.p
                  key={posts[index].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-serif text-[#faf9f6] text-sm md:text-base line-clamp-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {posts[index].title}
                </motion.p>
              ) : (
                <p className="font-serif text-[#faf9f6]/80 text-sm md:text-base" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Próximamente nuevas historias
                </p>
              )}
            </AnimatePresence>
            {hasPosts && posts.length > 1 && (
              <div className="flex gap-1 mt-2">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ver tarjeta ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === index ? "w-4 bg-[#C5A059]" : "w-1 bg-[#C5A059]/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <Link
          href="/descubre"
          className="shrink-0 border border-[#C5A059] text-[#C5A059] font-sans text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#C5A059] hover:text-[#0A0A0A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        >
          Descubre Viñales
        </Link>
      </div>
    </section>
  );
}
