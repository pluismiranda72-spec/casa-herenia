"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";

const TRIPADVISOR_URL =
  "https://www.tripadvisor.es/Hotel_Review-g616288-d15045948-Reviews-Casa_Herenia_y_Pedro-Vinales_Pinar_del_Rio_Province_Cuba.html";

interface ExternalReview {
  id: string | number;
  author: string;
  rating: number;
  text: string;
  source: string;
  date: string;
}

function ReviewCardSkeleton() {
  return (
    <div className="bg-white/5 border border-[#C5A059]/20 p-8 animate-pulse">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 rounded bg-white/10" />
        ))}
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-4 bg-white/10 rounded w-3/5" />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="h-4 bg-white/10 rounded w-24" />
        <div className="h-3 bg-white/10 rounded w-16" />
      </div>
    </div>
  );
}

export default function ExternalReviewsSection() {
  const [reviews, setReviews] = useState<ExternalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetch("/api/external-reviews")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        const isErrorPayload =
          data &&
          typeof data === "object" &&
          "error" in data &&
          (data as { error: boolean }).error;
        const message = (data as { message?: string })?.message;

        if (!ok || isErrorPayload) {
          setError(message ?? "Error desconocido");
          setReviews([]);
          return;
        }
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[#0A0A0A] border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-[#C5A059] mb-4">
            Reconocimiento Internacional
          </h2>
          <p className="text-gray-400 font-sans text-sm tracking-widest uppercase">
            Lo que dicen en TripAdvisor
          </p>
        </div>

        {/* Grid de Reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <>
              <ReviewCardSkeleton />
              <ReviewCardSkeleton />
              <ReviewCardSkeleton />
            </>
          ) : error ? (
            <p className="col-span-full text-center text-red-400 font-sans text-sm py-8" role="alert">
              Error cargando TripAdvisor: {error}
            </p>
          ) : reviews.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 font-sans py-8">
              No hay reseñas disponibles aún.
            </p>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-[#C5A059]/20 p-8 relative group hover:bg-white/10 transition-colors duration-300"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#C5A059]/20" />

                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-[#C5A059] fill-[#C5A059]"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                <p className="font-serif italic text-gray-300 mb-6 text-lg leading-relaxed">
                  &quot;{review.text}&quot;
                </p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-sans font-bold text-white text-sm tracking-widest uppercase">
                    {review.author}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500">{review.source}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Botón: enlace al perfil TripAdvisor */}
        <div className="mt-12 text-center">
          <a
            href={TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#C5A059] bg-transparent text-[#C5A059] font-sans text-xs font-medium uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-colors cursor-pointer"
          >
            Leer más opiniones en TripAdvisor
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
