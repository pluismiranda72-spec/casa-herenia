"use client";

import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";

const TRIPADVISOR_URL =
  "https://www.tripadvisor.es/Hotel_Review-g616288-d15045948-Reviews-Casa_Herenia_y_Pedro-Vinales_Pinar_del_Rio_Province_Cuba.html";

// Datos "Mock" (Falsos) fijos para visualización inmediata
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Sarah Jenkins",
    rating: 5,
    text: "The sunrise view is breathtaking. Luxury service in the middle of nature.",
    source: "TripAdvisor",
    date: "Hace 2 semanas"
  },
  {
    id: 2,
    author: "Marc Dubois",
    rating: 5,
    text: "Le petit déjeuner est magnifique. Best casa in Viñales without doubt.",
    source: "TripAdvisor",
    date: "Hace 1 mes"
  },
  {
    id: 3,
    author: "Elena R.",
    rating: 5,
    text: "Paz absoluta. La cama es súper cómoda y la atención de 10. Repetiremos.",
    source: "TripAdvisor",
    date: "Hace 1 mes"
  }
];

export default function ExternalReviewsSection() {
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
          {MOCK_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-[#C5A059]/20 p-8 relative group hover:bg-white/10 transition-colors duration-300"
            >
              {/* Icono Comillas decorativo */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#C5A059]/20" />

              {/* Estrellas */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-[#C5A059] fill-[#C5A059]" : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Texto */}
              <p className="font-serif italic text-gray-300 mb-6 text-lg leading-relaxed">
                "{review.text}"
              </p>

              {/* Autor y Fuente */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-sans font-bold text-white text-sm tracking-widest uppercase">
                  {review.author}
                </span>
                <div className="flex items-center gap-2">
                  {/* Icono TripAdvisor simplificado (círculo) */}
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500">{review.source}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botón de autoridad: enlace al perfil TripAdvisor */}
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