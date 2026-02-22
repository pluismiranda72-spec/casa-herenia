"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const SCROLL_STEP = 300;

type Award = {
  id: string;
  image_url: string;
  position: number;
  created_at: string;
};

export default function AwardsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [awards, setAwards] = useState<Award[]>([]);

  console.log("Premios encontrados:", awards.length);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("awards")
      .select("id, image_url, position, created_at")
      .order("position", { ascending: true })
      .then(({ data }) => setAwards(data ?? []));
  }, []);

  function scrollLeft() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  }

  function scrollRight() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  }

  return (
    <section
      className="w-full py-16 md:py-20 px-4 md:px-6 bg-[#F9F9F9] relative group/aw"
      aria-labelledby="awards-heading"
    >
      <div className="container mx-auto">
        <h2
          id="awards-heading"
          className="font-serif text-black uppercase tracking-widest text-sm text-center mb-12"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          NUESTROS PREMIOS
        </h2>

        {awards.length === 0 ? (
          <p className="font-sans text-sm text-center text-gray-600 max-w-xl mx-auto">
            Galardonados por la excelencia (Panel de Premios vacío, sube imágenes en /admin/premios)
          </p>
        ) : (
        <div className="relative max-w-7xl mx-auto">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-transparent border border-transparent rounded-full text-gray-400 opacity-60 group-hover/aw:opacity-100 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 shrink-0"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>

          <div
            ref={scrollRef}
            className={`flex gap-4 md:gap-6 overflow-x-auto scroll-smooth items-center py-4 px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${awards.length <= 5 ? "justify-center" : ""}`}
          >
            {awards.map((award) => (
              <div
                key={award.id}
                className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-[calc((100%-1.5rem*4)/5)] flex flex-col items-center justify-center min-w-0"
              >
                <div className="relative w-full h-32 md:h-40">
                  <Image
                    src={optimizeCloudinaryUrl(award.image_url)}
                    alt={`Premio ${award.position}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-contain"
                    unoptimized={award.image_url.startsWith("http")}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-transparent border border-transparent rounded-full text-gray-400 opacity-60 group-hover/aw:opacity-100 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 shrink-0"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
        )}
      </div>
    </section>
  );
}
