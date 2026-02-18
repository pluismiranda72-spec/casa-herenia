"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  media_url: string | null;
  media_type: string | null;
  type: string | null;
  instagram_url: string | null;
};

const SCROLL_STEP = 300;

function displayTitle(title: string): string {
  if (title === "El Santuario de Piedra y Alma") return "Viñales: un lugar mágico";
  return title;
}

export default function ViñalesMiniWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("id, title, slug, media_url, media_type, type, instagram_url")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const step = direction === "left" ? -SCROLL_STEP : SCROLL_STEP;
    el.scrollTo({ left: el.scrollLeft + step, behavior: "smooth" });
  }

  const hasPosts = posts.length > 0;

  return (
    <section
      className="w-full bg-[#0A0A0A]/95 border-t border-[#C5A059]/20 py-8 px-4"
      aria-label="Descubre Viñales"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-xl md:text-2xl text-white">
            Historias del Valle
          </h2>
          <Link
            href="/descubre"
            className="shrink-0 border border-[#C5A059] text-[#C5A059] font-sans text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#C5A059] hover:text-[#0A0A0A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
          >
            DESCUBRE VIÑALES
          </Link>
        </div>

        <div className="relative">
          {/* Flechas */}
          {hasPosts && posts.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Anterior"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-[#C5A059] text-white flex items-center justify-center transition-colors -left-4 md:-left-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Siguiente"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-[#C5A059] text-white flex items-center justify-center transition-colors -right-4 md:-right-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Contenedor del carrusel */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {hasPosts ? (
              posts.map((post) => {
                const isInstagram = post.type === "instagram" && post.instagram_url;
                const mediaUrl = post.media_url;
                const cardContent = (
                  <>
                    <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-[#1a1a1a]">
                      {mediaUrl ? (
                        <Image
                          src={mediaUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="240px"
                          unoptimized={mediaUrl.startsWith("http")}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C5A059]/60 font-serif text-sm">
                          Viñales
                        </div>
                      )}
                      {isInstagram && (
                        <>
                          <div className="absolute inset-0 bg-black/20" aria-hidden />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-[#0A0A0A] fill-current" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <p
                      className="mt-3 font-serif text-sm text-gray-200 text-center line-clamp-2"
                      style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
                    >
                      {displayTitle(post.title)}
                    </p>
                  </>
                );
                if (isInstagram) {
                  return (
                    <a
                      key={post.id}
                      href={post.instagram_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col min-w-[240px] max-w-[240px] shrink-0 group"
                    >
                      {cardContent}
                    </a>
                  );
                }
                return (
                  <Link
                    key={post.id}
                    href={`/descubre/${post.slug}`}
                    className="flex flex-col min-w-[240px] max-w-[240px] shrink-0 group"
                  >
                    {cardContent}
                  </Link>
                );
              })
            ) : (
              <div className="min-w-[240px] max-w-[240px] flex flex-col shrink-0">
                <div className="w-full aspect-[4/3] rounded-md bg-[#1a1a1a] flex items-center justify-center text-[#C5A059]/60 font-serif text-sm px-4 text-center">
                  Próximamente nuevas historias
                </div>
                <p className="mt-3 font-serif text-sm text-gray-400 text-center">
                  Próximamente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
