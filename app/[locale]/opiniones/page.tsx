import { createClient } from "@/lib/supabase/server";
import { Star, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opiniones | Casa Herenia y Pedro",
  description: "Lo que dicen nuestros huéspedes sobre su estancia.",
};

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 shrink-0 ${
            i < (count ?? 0) ? "text-[#C5A059] fill-[#C5A059]" : "text-white/20"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default async function OpinionesPage() {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, comment, title, categories, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[opiniones] Supabase:", error);
  }

  const list = reviews ?? [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white">
            Lo que dicen nuestros huéspedes
          </h1>
          <p className="mt-4 font-sans text-white/70 max-w-xl mx-auto">
            Experiencias reales de quienes han pasado unos días con nosotros.
          </p>
        </header>

        {list.length === 0 ? (
          <p className="text-center font-sans text-white/60 py-12">
            Aún no hay opiniones publicadas. ¡Serás el primero en dejar la tuya después de tu estancia!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {list.map((review) => (
              <article
                key={review.id}
                className="relative rounded-xl bg-white/5 backdrop-blur-md border border-[#C5A059]/30 p-5 md:p-6"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C5A059]/20 border border-[#C5A059]/40">
                  <Check className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden />
                  <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                    Estancia verificada
                  </span>
                </div>
                <Stars count={review.rating} />
                {review.title && (
                  <h2 className="mt-3 font-sans font-semibold text-white">
                    {review.title}
                  </h2>
                )}
                <blockquote className="mt-2 font-serif text-base md:text-lg text-white/95 italic leading-relaxed line-clamp-6">
                  &ldquo;{review.comment || "—"}&rdquo;
                </blockquote>
                <cite className="mt-4 not-italic block font-sans text-sm font-bold uppercase tracking-widest text-[#C5A059]">
                  — {review.author_name}
                </cite>
                <time className="mt-1 block font-sans text-xs text-white/50">
                  {new Date(review.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
